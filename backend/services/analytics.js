import crypto from 'crypto';
import { getClient, query as dbQuery } from '../db/client.js';

const INACTIVITY_MS = 30 * 60 * 1000;
const MAX_DURATION_SECONDS = 24 * 60 * 60;

const trimValue = (value, maxLength) => typeof value === 'string' ? value.trim().slice(0, maxLength) : null;

export const isUuid = (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export const isPath = (value) => typeof value === 'string' && /^\/[a-zA-Z0-9/_-]{0,199}$/.test(value);

export const classifyReferrer = (referrer) => {
  if (!referrer) return { source: 'Direct', host: null };
  try {
    const host = new URL(referrer).hostname.toLowerCase().slice(0, 255);
    if (/(^|\.)google\./.test(host)) return { source: 'Google', host };
    if (/(^|\.)linkedin\.com$/.test(host)) return { source: 'LinkedIn', host };
    if (/(^|\.)github\.com$/.test(host)) return { source: 'GitHub', host };
    return { source: 'Other', host };
  } catch {
    return { source: 'Direct', host: null };
  }
};

export const classifyDevice = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  const deviceType = /ipad|tablet/.test(ua) ? 'Tablet' : /mobi|iphone|android/.test(ua) ? 'Mobile' : /windows|macintosh|linux|cros/.test(ua) ? 'Desktop' : 'Other';
  const browser = /edg\//.test(ua) ? 'Edge' : /firefox\//.test(ua) ? 'Firefox' : /chrome\//.test(ua) && !/edg\//.test(ua) ? 'Chrome' : /safari\//.test(ua) && !/chrome\//.test(ua) ? 'Safari' : 'Other';
  const operatingSystem = /windows/.test(ua) ? 'Windows' : /iphone|ipad|ipod/.test(ua) ? 'iOS' : /android/.test(ua) ? 'Android' : /mac os/.test(ua) ? 'macOS' : /linux/.test(ua) ? 'Linux' : 'Other';
  return { deviceType, browser, operatingSystem };
};

// Vercel and many reverse proxies provide these coarse location headers. They are
// used only for this request and never persisted alongside the originating IP.
export const locationFromHeaders = (headers) => ({
  country: trimValue(headers['x-vercel-ip-country'] || headers['cf-ipcountry'], 100),
  region: trimValue(headers['x-vercel-ip-country-region'], 100),
  city: trimValue(headers['x-vercel-ip-city'], 100),
});

export const screenBucket = (width, height) => {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > 10000 || h > 10000) return 'Unknown';
  const longest = Math.max(w, h);
  if (longest < 768) return 'Small';
  if (longest < 1200) return 'Medium';
  if (longest < 1920) return 'Large';
  return 'XLarge';
};

export const createSession = async ({ visitorId, path, referrer, utm = {}, screen }, headers) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const visitor = await client.query(
      `INSERT INTO analytics_visitors (id, first_seen_at, last_seen_at, visit_count)
       VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
       ON CONFLICT (id) DO UPDATE SET last_seen_at = CURRENT_TIMESTAMP, visit_count = analytics_visitors.visit_count + 1
       RETURNING (visit_count = 1) AS is_new`,
      [visitorId]
    );
    const sessionId = crypto.randomUUID();
    const source = classifyReferrer(referrer);
    const device = classifyDevice(headers['user-agent']);
    const location = locationFromHeaders(headers);
    await client.query(
      `INSERT INTO analytics_sessions
      (id, visitor_id, entry_page, referrer_source, referrer_host, utm_source, utm_medium, utm_campaign, country, region, city, ip_address, device_type, browser, operating_system, screen_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [sessionId, visitorId, path, source.source, source.host, trimValue(utm.source, 100), trimValue(utm.medium, 100), trimValue(utm.campaign, 100), location.country, location.region, location.city, headers.ip || null, device.deviceType, device.browser, device.operatingSystem, screenBucket(screen?.width, screen?.height)]
    );
    await client.query('COMMIT');
    return { sessionId, isNewVisitor: visitor.rows[0].is_new };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const recordConsent = async (visitorId, consentVersion) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO analytics_visitors (id, first_seen_at, last_seen_at, visit_count)
       VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)
       ON CONFLICT (id) DO NOTHING`,
      [visitorId]
    );
    await client.query(
      `INSERT INTO analytics_consents (visitor_id, status, consent_version, granted_at)
       SELECT $1, 'allowed', $2::varchar(32), CURRENT_TIMESTAMP
       WHERE COALESCE((
         SELECT status FROM analytics_consents
         WHERE visitor_id = $1 AND consent_version = $2::varchar(32)
         ORDER BY created_at DESC LIMIT 1
       ), '') <> 'allowed'`,
      [visitorId, consentVersion]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
};

export const withdrawConsent = async (visitorId, consentVersion) => {
  await dbQuery(
    `INSERT INTO analytics_consents (visitor_id, status, consent_version, withdrawn_at)
     SELECT $1, 'withdrawn', $2::varchar(32), CURRENT_TIMESTAMP
     WHERE EXISTS (SELECT 1 FROM analytics_visitors WHERE id = $1)`,
    [visitorId, consentVersion]
  );
};

export const hasActiveConsent = async (visitorId, consentVersion) => {
  const result = await dbQuery(
    `SELECT status FROM analytics_consents WHERE visitor_id = $1 AND consent_version = $2
     ORDER BY created_at DESC LIMIT 1`,
    [visitorId, consentVersion]
  );
  return result.rows[0]?.status === 'allowed';
};

export const cleanupAnalytics = async () => {
  const ipDays = Math.max(Number.parseInt(process.env.ANALYTICS_IP_RETENTION_DAYS || '30', 10) || 30, 1);
  const analyticsDays = Math.max(Number.parseInt(process.env.ANALYTICS_RETENTION_DAYS || '365', 10) || 365, 1);
  const [anonymized, deleted] = await Promise.all([
    dbQuery(`UPDATE analytics_sessions SET ip_address = NULL WHERE ip_address IS NOT NULL AND started_at < CURRENT_TIMESTAMP - $1::interval`, [`${ipDays} days`]),
    dbQuery(`DELETE FROM analytics_sessions WHERE started_at < CURRENT_TIMESTAMP - $1::interval`, [`${analyticsDays} days`]),
  ]);
  return { anonymized: anonymized.rowCount, deleted: deleted.rowCount };
};

export const recordPageView = async ({ sessionId, path, durationSeconds = 0 }) => {
  const duration = Math.min(Math.max(Number(durationSeconds) || 0, 0), MAX_DURATION_SECONDS);
  await dbQuery(
    `INSERT INTO analytics_page_views (session_id, path, ended_at, duration_seconds)
     VALUES ($1, $2, CURRENT_TIMESTAMP, $3)`,
    [sessionId, path, duration]
  );
  await dbQuery('UPDATE analytics_sessions SET last_activity_at = CURRENT_TIMESTAMP, exit_page = $2 WHERE id = $1', [sessionId, path]);
};

export const recordProjectView = async ({ sessionId, projectId, projectName }) => {
  await dbQuery(
    `INSERT INTO analytics_project_views (session_id, project_id, project_name)
     VALUES ($1, $2, $3)`,
    [sessionId, projectId || null, projectName]
  );
  await dbQuery('UPDATE analytics_sessions SET last_activity_at = CURRENT_TIMESTAMP WHERE id = $1', [sessionId]);
};

export const recordEvent = async ({ sessionId, eventName, pagePath, metadata = {} }) => {
  await dbQuery(
    `INSERT INTO analytics_events (session_id, event_name, page_path, metadata)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [sessionId, eventName, pagePath || null, JSON.stringify(metadata)]
  );
};

export const endSession = async ({ sessionId, exitPage }) => {
  await dbQuery(
    `UPDATE analytics_sessions
     SET ended_at = COALESCE(ended_at, CURRENT_TIMESTAMP), last_activity_at = CURRENT_TIMESTAMP, exit_page = $2
     WHERE id = $1 AND (ended_at IS NULL OR ended_at > CURRENT_TIMESTAMP - INTERVAL '1 day')`,
    [sessionId, exitPage]
  );
};

export const isSessionActive = async (sessionId) => {
  const consentVersion = process.env.ANALYTICS_CONSENT_VERSION || '1';
  const result = await dbQuery(
    `SELECT analytics_sessions.id FROM analytics_sessions
     WHERE id = $1
       AND last_activity_at > CURRENT_TIMESTAMP - $2::interval
       AND (ended_at IS NULL OR ended_at > CURRENT_TIMESTAMP - INTERVAL '5 minutes')
       AND (SELECT status FROM analytics_consents WHERE visitor_id = analytics_sessions.visitor_id AND consent_version = $3 ORDER BY created_at DESC LIMIT 1) = 'allowed'`,
    [sessionId, `${Math.floor(INACTIVITY_MS / 60000)} minutes`, consentVersion]
  );
  return result.rowCount > 0;
};
