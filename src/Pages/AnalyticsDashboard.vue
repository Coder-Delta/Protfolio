<script setup>
import { computed, ref } from 'vue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const token = ref(sessionStorage.getItem('portfolio-analytics-admin-token') || '');
const password = ref('');
const error = ref('');
const loading = ref(false);
const days = ref(30);
const customStart = ref('');
const customEnd = ref('');
const data = ref(null);
const max = (items) => Math.max(...(items || []).map((item) => item.value), 1);
const duration = (seconds = 0) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
const rangeLabel = computed(() => customStart.value && customEnd.value ? `${customStart.value} to ${customEnd.value}` : days.value === 1 ? 'Today' : `Last ${days.value} days`);

const request = async (url, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'Request failed');
    return result.data;
};
const load = async (custom = false) => {
    if (!token.value) return;
    loading.value = true; error.value = '';
    try { const query = custom && customStart.value && customEnd.value ? `start=${customStart.value}&end=${customEnd.value}` : `days=${days.value}`; data.value = await request(`/analytics/admin/summary?${query}`, { headers: { Authorization: `Bearer ${token.value}` } }); }
    catch (err) { error.value = err.message; if (/Authentication/.test(err.message)) logout(); }
    finally { loading.value = false; }
};
const login = async () => {
    loading.value = true; error.value = '';
    try { const result = await request('/analytics/admin/login', { method: 'POST', body: JSON.stringify({ password: password.value }) }); token.value = result.token; sessionStorage.setItem('portfolio-analytics-admin-token', token.value); password.value = ''; await load(); }
    catch (err) { error.value = err.message; }
    finally { loading.value = false; }
};
const logout = () => { token.value = ''; data.value = null; sessionStorage.removeItem('portfolio-analytics-admin-token'); };
if (token.value) load();
</script>

<template>
    <main class="analytics-page">
        <section v-if="!token" class="login-card">
            <h1>Analytics dashboard</h1><p>Private access only.</p>
            <form @submit.prevent="login"><label>Password<input v-model="password" type="password" autocomplete="current-password" required /></label><button :disabled="loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button></form>
            <p v-if="error" class="error">{{ error }}</p>
        </section>
        <section v-else class="dashboard">
            <header><div><h1>Analytics dashboard</h1><p>{{ rangeLabel }} · anonymous, consented visits only</p></div><button class="secondary" @click="logout">Sign out</button></header>
            <nav class="filters" aria-label="Date range"><button v-for="option in [1, 7, 30, 90]" :key="option" :class="{ active: days === option && !customStart }" @click="customStart = ''; customEnd = ''; days = option; load()">{{ option === 1 ? 'Today' : `${option} days` }}</button><label>Custom <input v-model="customStart" type="date" aria-label="Custom start date" /> <input v-model="customEnd" type="date" aria-label="Custom end date" /></label><button :disabled="!customStart || !customEnd || customStart > customEnd" @click="load(true)">Apply</button></nav>
            <p v-if="error" class="error">{{ error }}</p><p v-if="loading">Loading analytics…</p>
            <template v-if="data && !loading">
                <div class="metrics"><article><small>Total visitors</small><strong>{{ data.overview.total_visitors }}</strong></article><article><small>Unique visitors</small><strong>{{ data.overview.unique_visitors }}</strong></article><article><small>Page views</small><strong>{{ data.overview.page_views }}</strong></article><article><small>New visitors</small><strong>{{ data.overview.new_visitors }}</strong></article><article><small>Returning visitors</small><strong>{{ data.overview.returning_visitors }}</strong></article><article><small>Sessions</small><strong>{{ data.overview.sessions }}</strong></article><article><small>Average session</small><strong>{{ duration(data.overview.average_session_seconds) }}</strong></article></div>
                <div class="charts"><article class="wide"><h2>Daily sessions</h2><div class="trend"><div v-for="item in data.trends" :key="item.label" class="bar-item"><span class="bar" :style="{ height: `${(item.value / max(data.trends)) * 100}%` }" :title="`${item.label}: ${item.value}`"></span><small>{{ item.label.slice(5) }}</small></div></div></article><DataList title="Most visited pages" :items="data.pages" /><DataList title="Most viewed projects" :items="data.projects" /><DataList title="Traffic sources" :items="data.sources" /><DataList title="Countries" :items="data.countries" /><DataList title="Regions" :items="data.regions" /><DataList title="Cities" :items="data.cities" /><DataList title="Devices" :items="data.devices" /><DataList title="Browsers" :items="data.browsers" /><DataList title="Operating systems" :items="data.operatingSystems" /></div>
            </template>
        </section>
    </main>
</template>

<script>
export default { components: { DataList: { props: ['title', 'items'], methods: { width(item) { return `${(item.value / Math.max(...this.items.map((x) => x.value), 1)) * 100}%`; } }, template: `<article><h2>{{ title }}</h2><p v-if="!items.length" class="muted">No data yet.</p><ul v-else><li v-for="item in items" :key="item.label"><span>{{ item.label }}</span><b>{{ item.value }}</b><i :style="{ width: width(item) }"></i></li></ul></article>` } } };
</script>

<style scoped>
.analytics-page { min-height: 100vh; padding: 2rem; background: #f5f5f2; color: #171717; }.login-card, .dashboard { max-width: 1200px; margin: 0 auto; }.login-card { max-width: 420px; margin-top: 12vh; padding: 2rem; background: #fff; border: 1px solid #ddd; border-radius: 12px; }.login-card form { display: grid; gap: 1rem; }.login-card input { margin-top: .35rem; }.dashboard header { display: flex; justify-content: space-between; align-items: start; gap: 1rem; }.dashboard h1 { margin: 0; }.dashboard h2 { font-size: 1rem; margin-top: 0; }.filters { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin: 1.5rem 0; }.filters label { margin: 0; font-size: .8rem; }.filters input { width: auto; margin: 0 .15rem; padding: .35rem; }.filters button, .secondary { padding: .45rem .75rem; }.filters .active { background: #171717; border-color: #171717; color: #fff; }.metrics { display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 1rem; }.metrics article, .charts article { padding: 1rem; background: #fff; border: 1px solid #ddd; border-radius: 10px; }.metrics small { display: block; color: #666; }.metrics strong { display: block; margin-top: .3rem; font-size: 1.8rem; }.charts { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; margin-top: 1rem; }.wide { grid-column: span 3; }.trend { height: 150px; display: flex; align-items: end; gap: .5rem; }.bar-item { display: grid; flex: 1; height: 100%; align-items: end; gap: .25rem; text-align: center; }.bar { min-height: 2px; display: block; background: #171717; }.bar-item small { font-size: .65rem; }.charts :deep(ul) { padding: 0; margin: 0; list-style: none; }.charts :deep(li) { position: relative; display: grid; grid-template-columns: 1fr auto; gap: .5rem; padding: .35rem 0 .55rem; overflow: hidden; }.charts :deep(li i) { position: absolute; bottom: .15rem; left: 0; height: 2px; background: #777; }.muted { color: #666; }.error { color: #b00020; } @media (max-width: 850px) { .metrics { grid-template-columns: repeat(2, 1fr); }.charts { grid-template-columns: 1fr; }.wide { grid-column: span 1; } } @media (max-width: 500px) { .analytics-page { padding: 1rem; }.dashboard header { flex-direction: column; }.metrics { grid-template-columns: 1fr; } }
</style>
