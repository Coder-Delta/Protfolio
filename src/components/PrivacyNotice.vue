<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { analytics } from '@/services/analytics.js';

const decided = ref(analytics.hasConsent() || localStorage.getItem('portfolio-analytics-consent') === 'denied');
const open = ref(!decided.value);
const choose = (enabled) => {
    analytics.setConsent(enabled);
    decided.value = true;
    open.value = false;
};
const sync = () => { decided.value = analytics.hasConsent() || localStorage.getItem('portfolio-analytics-consent') === 'denied'; };
onMounted(() => window.addEventListener('analytics-consent-changed', sync));
onUnmounted(() => window.removeEventListener('analytics-consent-changed', sync));
</script>

<template>
    <aside v-if="open" class="privacy-notice" role="region" aria-label="Analytics privacy notice">
        <p>We use optional, anonymous analytics to understand visits and improve this portfolio. We do not collect names, emails, raw IP addresses, or fingerprints.</p>
        <div class="privacy-actions">
            <button type="button" class="allow" @click="choose(true)">Allow anonymous analytics</button>
            <button type="button" class="decline" @click="choose(false)">No thanks</button>
        </div>
    </aside>
    <button v-else class="privacy-settings" type="button" @click="open = true">Analytics preferences</button>
</template>

<style scoped>
.privacy-notice { position: fixed; right: 1rem; bottom: 1rem; z-index: 20; max-width: 410px; padding: 1rem; border: 1px solid #1a1a1a; border-radius: 8px; background: #fff; box-shadow: 0 8px 28px rgba(0,0,0,.18); font-size: .86rem; }
.privacy-notice p { margin: 0 0 .75rem; color: #333; }
.privacy-actions { display: flex; flex-wrap: wrap; gap: .5rem; }
.privacy-notice button, .privacy-settings { margin: 0; padding: .45rem .7rem; font-size: .8rem; cursor: pointer; }
.allow { background: #1a1a1a; border-color: #1a1a1a; color: #fff; }
.decline, .privacy-settings { background: #fff; border: 1px solid #555; color: #222; }
.privacy-settings { position: fixed; right: .65rem; bottom: .65rem; z-index: 20; opacity: .78; }
</style>
