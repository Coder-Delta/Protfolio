<script setup>
import Navbar from '@/components/Navbar.vue';
import { analytics } from '@/services/analytics.js';

const updatePreference = (allowed) => analytics.setConsent(allowed);
</script>

<template>
    <main>
        <Navbar />
        <article class="privacy container">
            <h1>Privacy &amp; Analytics Policy</h1>
            <p>Last updated: August 15, 2026. Analytics on this portfolio is optional and starts only after you choose Allow.</p>

            <h2>What we collect</h2>
            <p>When allowed, we collect a random anonymous visitor ID, session and page-view timing, pages and projects viewed, entry and exit pages, referrer category, UTM parameters, screen-size bucket, and broad device, browser, and operating-system categories. We may process your IP address on the server and store it temporarily to derive approximate country, region, and city. We do not request GPS location.</p>

            <h2>What we do not collect</h2>
            <p>Analytics never collects names, email addresses, passwords, contact-form content, keystrokes, clipboard data, camera or microphone data. It does not use browser fingerprinting or attempt to identify you as a person.</p>

            <h2>How data is used and retained</h2>
            <p>The information is used to understand portfolio traffic and improve its content. IP addresses are available only to the server and are automatically removed after the configured retention period (30 days by default). Anonymous analytics sessions are removed after the configured analytics retention period (365 days by default). The private portfolio owner is the only intended dashboard user. No third-party analytics service is used; hosting providers may supply coarse location headers.</p>

            <h2>Your choice</h2>
            <p>You can deny analytics without affecting access to the portfolio. You can also withdraw permission at any time below; withdrawal stops new events and removes the local anonymous identifier.</p>
            <div class="actions"><button type="button" @click="updatePreference(true)">Allow analytics</button><button type="button" class="secondary" @click="updatePreference(false)">Withdraw / deny analytics</button></div>

            <h2>Questions</h2>
            <p>For privacy questions, contact <a href="mailto:ranjitbhandary15@gmail.com">ranjitbhandary15@gmail.com</a>.</p>
        </article>
    </main>
</template>

<style scoped>
main { min-height: 100vh; background: #f5f5f2; }.privacy { max-width: 820px; padding: 2rem 1.5rem 4rem; }.privacy h1 { margin-top: 1rem; }.privacy h2 { margin-top: 2rem; font-size: 1.25rem; }.privacy p { line-height: 1.7; }.actions { display: flex; flex-wrap: wrap; gap: .75rem; }.actions button { margin: 0; }.secondary { background: #fff; color: #222; border-color: #555; }
</style>
