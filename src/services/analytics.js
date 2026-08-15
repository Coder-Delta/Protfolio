const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const CONSENT_KEY = 'portfolio-analytics-consent';
const CONSENT_DATE_KEY = 'portfolio-analytics-consent-date';
const VISITOR_KEY = 'portfolio-analytics-visitor';
const SESSION_KEY = 'portfolio-analytics-session';

let sessionId = null;
let currentPath = null;
let pageStartedAt = 0;
let initialized = false;

const isBrowser = () => typeof window !== 'undefined';
const today = () => new Date().toLocaleDateString('en-CA');
const hasDecisionToday = () => isBrowser() && localStorage.getItem(CONSENT_DATE_KEY) === today();
const consent = () => hasDecisionToday() && localStorage.getItem(CONSENT_KEY) === 'granted';
const uuid = () => crypto.randomUUID();
const send = async (path, payload, beacon = false) => {
  try {
    const body = JSON.stringify(payload);
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(`${API_BASE_URL}${path}`, new Blob([body], { type: 'application/json' }));
      return;
    }
    await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
  } catch {
    // Analytics is intentionally best-effort and must never affect the portfolio.
  }
};
const queryUtm = () => {
  const params = new URLSearchParams(window.location.search);
  return { source: params.get('utm_source'), medium: params.get('utm_medium'), campaign: params.get('utm_campaign') };
};
const visitorId = () => {
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;
  const value = uuid();
  localStorage.setItem(VISITOR_KEY, value);
  return value;
};
const registerConsent = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/consent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorId: visitorId() }),
    });
    return response.ok;
  } catch { return false; }
};
const finishPage = (beacon = false) => {
  if (!sessionId || !currentPath) return;
  const durationSeconds = Math.max(0, Math.round((performance.now() - pageStartedAt) / 1000));
  send('/analytics/page-view', { sessionId, path: currentPath, durationSeconds }, beacon);
};

export const analytics = {
  hasConsent: consent,
  hasDecisionToday,
  async setConsent(value) {
    if (!isBrowser()) return;
    if (!value) {
      finishPage(true);
      if (sessionId) send('/analytics/session-end', { sessionId, exitPage: currentPath || window.location.pathname }, true);
      const existingVisitorId = localStorage.getItem(VISITOR_KEY);
      if (existingVisitorId) send('/analytics/consent/withdraw', { visitorId: existingVisitorId }, true);
      localStorage.setItem(CONSENT_KEY, 'denied');
      localStorage.setItem(CONSENT_DATE_KEY, today());
      localStorage.removeItem(VISITOR_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      sessionId = null;
    } else {
      localStorage.setItem(CONSENT_KEY, 'granted');
      localStorage.setItem(CONSENT_DATE_KEY, today());
      this.start(window.location.pathname);
    }
    window.dispatchEvent(new CustomEvent('analytics-consent-changed'));
  },
  async start(path = window.location.pathname) {
    if (!consent() || sessionId) return;
    const currentVisitorId = visitorId();
    try {
      if (!await registerConsent()) return;
      const response = await fetch(`${API_BASE_URL}/analytics/session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: currentVisitorId, path, referrer: document.referrer || null, utm: queryUtm(), screen: { width: window.screen.width, height: window.screen.height } }),
      });
      const result = await response.json();
      if (!response.ok || !result?.data?.sessionId) return;
      sessionId = result.data.sessionId;
      sessionStorage.setItem(SESSION_KEY, sessionId);
      currentPath = path;
      pageStartedAt = performance.now();
    } catch {
      // No retry loop: analytics availability must not create work for visitors.
    }
  },
  async trackRoute(path) {
    if (!consent()) return;
    if (!sessionId) await this.start(path);
    if (!sessionId) return;
    if (currentPath && currentPath !== path) finishPage();
    currentPath = path;
    pageStartedAt = performance.now();
  },
  trackProject(project) {
    if (!consent() || !sessionId || !Number.isInteger(project?.id)) return;
    send('/analytics/project-view', { sessionId, projectId: project.id });
  },
  install(router) {
    if (!isBrowser() || initialized) return;
    initialized = true;
    router.afterEach((to) => { this.trackRoute(to.path); });
    window.addEventListener('pagehide', () => {
      if (!consent() || !sessionId) return;
      finishPage(true);
      send('/analytics/session-end', { sessionId, exitPage: currentPath || window.location.pathname }, true);
    });
    if (consent()) this.start(router.currentRoute.value.path);
  },
};
