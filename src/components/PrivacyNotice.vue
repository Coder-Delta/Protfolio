<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { analytics } from '@/services/analytics.js';
import { RouterLink } from 'vue-router';

const decided = ref(analytics.hasDecisionToday());
const open = ref(!decided.value);
const choose = async (enabled) => {
    await analytics.setConsent(enabled);
    decided.value = true;
    open.value = false;
};
const sync = () => { decided.value = analytics.hasDecisionToday(); };
onMounted(() => window.addEventListener('analytics-consent-changed', sync));
onUnmounted(() => window.removeEventListener('analytics-consent-changed', sync));
</script>

<template>
    <aside v-if="open" class="privacy-notice" role="region" aria-label="Analytics privacy notice">
        <p>We use optional analytics to understand visits, device type, approximate location, and traffic sources. <RouterLink to="/privacy-analytics">Privacy &amp; Analytics Policy</RouterLink></p>
        <div class="privacy-actions">
            <button type="button" class="choice" @click="choose(true)">Allow</button>
            <button type="button" class="choice" @click="choose(false)">Deny</button>
        </div>
    </aside>
</template>

<style scoped>
.privacy-notice { position: fixed; right: 1rem; bottom: 1rem; z-index: 20; max-width: 410px; padding: 1rem; border: 1px solid #1a1a1a; border-radius: 8px; background: #fff; box-shadow: 0 8px 28px rgba(0,0,0,.18); font-size: .86rem; }
.privacy-notice p { margin: 0 0 .75rem; color: #333; }
.privacy-actions { display: flex; flex-wrap: wrap; gap: .5rem; }
.privacy-notice button { margin: 0; padding: .45rem .7rem; font-size: .8rem; cursor: pointer; }
.choice { background: #fff; border: 1px solid #555; color: #222; }
</style>
