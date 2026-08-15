import crypto from 'crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { query as dbQuery } from '../db/client.js';
import { createSession, endSession, isPath, isSessionActive, isUuid, recordEvent, recordPageView, recordProjectView } from '../services/analytics.js';

const router = express.Router();
const analyticsLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 90, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Too many analytics requests.' } });
const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Too many login attempts.' } });
const EVENT_NAMES = new Set(['privacy_notice_dismissed']);

const analyticsError = (res, error) => {
  console.error('Analytics error:', error.message);
  return res.status(503).json({ success: false, message: 'Analytics is temporarily unavailable.' });
};
const validationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ success: false, message: 'Invalid analytics payload.' });
  return true;
};
const validSession = async (sessionId) => isUuid(sessionId) && isSessionActive(sessionId);

router.post('/session', analyticsLimiter, [
  body('visitorId').custom(isUuid),
  body('path').custom(isPath),
  body('referrer').optional().isString().isLength({ max: 2048 }),
  body('utm').optional().isObject(),
  body('screen').optional().isObject(),
], async (req, res) => {
  if (validationErrors(req, res)) return;
  try {
    const data = await createSession(req.body, req.headers);
    res.status(201).json({ success: true, data });
  } catch (error) { analyticsError(res, error); }
});

router.post('/page-view', analyticsLimiter, [
  body('sessionId').custom(isUuid), body('path').custom(isPath), body('durationSeconds').optional().isInt({ min: 0, max: 86400 }),
], async (req, res) => {
  if (validationErrors(req, res)) return;
  try {
    if (!await validSession(req.body.sessionId)) return res.status(202).json({ success: true });
    await recordPageView(req.body);
    res.status(202).json({ success: true });
  } catch (error) { analyticsError(res, error); }
});

router.post('/project-view', analyticsLimiter, [
  body('sessionId').custom(isUuid), body('projectId').isInt({ min: 1 }),
], async (req, res) => {
  if (validationErrors(req, res)) return;
  try {
    if (!await validSession(req.body.sessionId)) return res.status(202).json({ success: true });
    const project = await dbQuery('SELECT id, title FROM projects WHERE id = $1', [req.body.projectId]);
    if (!project.rowCount) return res.status(202).json({ success: true });
    await recordProjectView({ sessionId: req.body.sessionId, projectId: project.rows[0].id, projectName: project.rows[0].title });
    res.status(202).json({ success: true });
  } catch (error) { analyticsError(res, error); }
});

router.post('/event', analyticsLimiter, [
  body('sessionId').custom(isUuid), body('eventName').isString().isLength({ min: 1, max: 50 }), body('pagePath').optional().custom(isPath), body('metadata').optional().isObject(),
], async (req, res) => {
  if (validationErrors(req, res)) return;
  if (!EVENT_NAMES.has(req.body.eventName)) return res.status(400).json({ success: false, message: 'Invalid analytics event.' });
  try {
    if (!await validSession(req.body.sessionId)) return res.status(202).json({ success: true });
    await recordEvent({ ...req.body, metadata: {} });
    res.status(202).json({ success: true });
  } catch (error) { analyticsError(res, error); }
});

router.post('/session-end', analyticsLimiter, [body('sessionId').custom(isUuid), body('exitPage').custom(isPath)], async (req, res) => {
  if (validationErrors(req, res)) return;
  try { await endSession(req.body); res.status(202).json({ success: true }); } catch (error) { analyticsError(res, error); }
});

const tokenSecret = () => process.env.ANALYTICS_ADMIN_TOKEN_SECRET || process.env.ANALYTICS_ADMIN_PASSWORD;
const sign = (value) => crypto.createHmac('sha256', tokenSecret()).update(value).digest('base64url');
const createToken = () => {
  const payload = Buffer.from(JSON.stringify({ role: 'analytics-admin', exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
};
const requireAdmin = (req, res, next) => {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !tokenSecret()) return res.status(401).json({ success: false, message: 'Authentication required.' });
  const [payload, signature] = token.split('.');
  const signatureBuffer = Buffer.from(signature || '');
  const expectedSignature = Buffer.from(payload ? sign(payload) : '');
  if (!payload || !signature || signatureBuffer.length !== expectedSignature.length || !crypto.timingSafeEqual(signatureBuffer, expectedSignature)) return res.status(401).json({ success: false, message: 'Authentication required.' });
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.role !== 'analytics-admin' || data.exp < Date.now()) throw new Error('expired');
    next();
  } catch { return res.status(401).json({ success: false, message: 'Authentication required.' }); }
};

router.post('/admin/login', adminLimiter, [body('password').isString().isLength({ min: 1, max: 1024 })], (req, res) => {
  if (validationErrors(req, res) || !process.env.ANALYTICS_ADMIN_PASSWORD) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  const supplied = Buffer.from(req.body.password);
  const expected = Buffer.from(process.env.ANALYTICS_ADMIN_PASSWORD);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  res.json({ success: true, data: { token: createToken(), expiresInSeconds: 28800 } });
});

const rangeFilter = (req) => {
  const start = typeof req.query.start === 'string' ? req.query.start : '';
  const end = typeof req.query.end === 'string' ? req.query.end : '';
  if (start || end) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || start > end) return { invalid: true };
    return { days: null, start, end, params: [start, end], where: (column) => `${column} >= $1::date AND ${column} < $2::date + INTERVAL '1 day'` };
  }
  const days = Number(req.query.days || 30);
  const validDays = Number.isInteger(days) && [1, 7, 30, 90].includes(days) ? days : 30;
  return { days: validDays, params: [`${validDays} days`], where: (column) => `${column} >= CURRENT_TIMESTAMP - $1::interval` };
};
router.get('/admin/summary', requireAdmin, async (req, res) => {
  const range = rangeFilter(req);
  if (range.invalid) return res.status(400).json({ success: false, message: 'A valid custom start and end date are required.' });
  const f = range.where;
  const params = range.params;
  try {
    const [overview, pages, projects, sources, locations, devices, browsers, operatingSystems, trends] = await Promise.all([
      dbQuery(`SELECT (SELECT COUNT(*)::int FROM analytics_visitors) AS total_visitors, (SELECT COUNT(*)::int FROM analytics_page_views WHERE ${f('started_at')}) AS page_views, COUNT(*)::int AS sessions, COUNT(DISTINCT visitor_id)::int AS unique_visitors, COUNT(DISTINCT visitor_id) FILTER (WHERE visit_count = 1)::int AS new_visitors, COUNT(DISTINCT visitor_id) FILTER (WHERE visit_count > 1)::int AS returning_visitors, COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(ended_at, last_activity_at) - started_at))) )::int, 0) AS average_session_seconds FROM analytics_sessions JOIN analytics_visitors ON analytics_visitors.id = analytics_sessions.visitor_id WHERE ${f('started_at')}`, params),
      dbQuery(`SELECT path AS label, COUNT(*)::int AS value, COALESCE(ROUND(AVG(duration_seconds))::int, 0) AS average_seconds FROM analytics_page_views WHERE ${f('started_at')} GROUP BY path ORDER BY value DESC LIMIT 10`, params),
      dbQuery(`SELECT project_name AS label, COUNT(*)::int AS value FROM analytics_project_views WHERE ${f('viewed_at')} GROUP BY project_name ORDER BY value DESC LIMIT 10`, params),
      dbQuery(`SELECT referrer_source AS label, COUNT(*)::int AS value FROM analytics_sessions WHERE ${f('started_at')} GROUP BY referrer_source ORDER BY value DESC`, params),
      dbQuery(`SELECT COALESCE(NULLIF(city, ''), NULLIF(region, ''), NULLIF(country, ''), 'Unknown') AS label, COUNT(*)::int AS value FROM analytics_sessions WHERE ${f('started_at')} GROUP BY 1 ORDER BY value DESC LIMIT 10`, params),
      dbQuery(`SELECT device_type AS label, COUNT(*)::int AS value FROM analytics_sessions WHERE ${f('started_at')} GROUP BY device_type ORDER BY value DESC`, params),
      dbQuery(`SELECT browser AS label, COUNT(*)::int AS value FROM analytics_sessions WHERE ${f('started_at')} GROUP BY browser ORDER BY value DESC`, params),
      dbQuery(`SELECT operating_system AS label, COUNT(*)::int AS value FROM analytics_sessions WHERE ${f('started_at')} GROUP BY operating_system ORDER BY value DESC`, params),
      dbQuery(`SELECT TO_CHAR(date_trunc('day', started_at), 'YYYY-MM-DD') AS label, COUNT(*)::int AS value, COUNT(DISTINCT visitor_id)::int AS visitors FROM analytics_sessions WHERE ${f('started_at')} GROUP BY 1 ORDER BY 1`, params),
    ]);
    res.json({ success: true, data: { days: range.days, start: range.start, end: range.end, overview: overview.rows[0], pages: pages.rows, projects: projects.rows, sources: sources.rows, locations: locations.rows, devices: devices.rows, browsers: browsers.rows, operatingSystems: operatingSystems.rows, trends: trends.rows } });
  } catch (error) { analyticsError(res, error); }
});

export default router;
