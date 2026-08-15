<script setup>
import { reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import { contactAPI } from '@/services/api.js';
import '@picocss/pico';

const activeCategory = ref(null);
const contactForm = reactive({ name: '', email: '', subject: '', message: '' });
const contactStatus = ref('idle');
const contactMessage = ref('');

const toggleCategory = (category) => {
    activeCategory.value = activeCategory.value === category ? null : category;
};

const submitContact = async () => {
    if (contactStatus.value === 'submitting') return;

    contactStatus.value = 'submitting';
    contactMessage.value = '';
    try {
        const result = await contactAPI.submit(contactForm);
        contactStatus.value = 'success';
        contactMessage.value = result.message || 'Thanks — your message has been sent.';
        Object.assign(contactForm, { name: '', email: '', subject: '', message: '' });
    } catch (error) {
        contactStatus.value = 'error';
        contactMessage.value = error.message || 'Your message could not be sent. Please try again.';
    }
};
</script>

<template>
    <main>
        <Navbar />
        <section class="container about-me">
            <div class="content-wrapper">

                <div class="category" style="animation-delay: 0s">
                    <button class="nav-label" type="button" :aria-expanded="activeCategory === 'ENTREPRENEUR'" @click="toggleCategory('ENTREPRENEUR')">ENTREPRENEUR</button>
                    <transition name="fade">
                        <div v-if="activeCategory === 'ENTREPRENEUR'" class="description">
                            <p>
                                I turn ideas into practical solutions, finding opportunities
                                and building products with purpose.
                            </p>
                            <a href="https://zolora.co.in" target="_blank" rel="noopener noreferrer" class="section-link">Go to Zolora →</a>
                        </div>
                    </transition>
                </div>

                <div class="category" style="animation-delay: 0.1s">
                    <button class="nav-label" type="button" :aria-expanded="activeCategory === 'DEVELOP'" @click="toggleCategory('DEVELOP')">DEVELOPER</button>
                    <transition name="fade">
                        <div v-if="activeCategory === 'DEVELOP'" class="description">
                            <p>
                                I build applications using modern web technologies.
                                I focus on writing clean code that works well.
                            </p>
                            <RouterLink to="/projects" class="section-link">Explore My Projects →</RouterLink>
                        </div>
                    </transition>
                </div>

                <div class="category" style="animation-delay: 0.3s">
                    <button class="nav-label" type="button" :aria-expanded="activeCategory === 'CONTACT'" @click="toggleCategory('CONTACT')">LET'S CONNECT</button>
                    <transition name="fade">
                        <form v-if="activeCategory === 'CONTACT'" class="contact-form" @submit.prevent="submitContact">
                            <p>Have a project or opportunity in mind? Send me a note.</p>
                            <label>Name<input v-model.trim="contactForm.name" required minlength="2" maxlength="255" autocomplete="name" /></label>
                            <label>Email<input v-model.trim="contactForm.email" required type="email" maxlength="255" autocomplete="email" /></label>
                            <label>Subject<input v-model.trim="contactForm.subject" required minlength="3" maxlength="255" /></label>
                            <label>Message<textarea v-model.trim="contactForm.message" required minlength="10" maxlength="5000" rows="4"></textarea></label>
                            <button class="section-link" type="submit" :disabled="contactStatus === 'submitting'">{{ contactStatus === 'submitting' ? 'Sending…' : 'Send Message →' }}</button>
                            <p v-if="contactStatus !== 'idle'" class="form-status" :class="contactStatus" role="status" aria-live="polite">{{ contactMessage }}</p>
                        </form>
                    </transition>
                </div>

            </div>
        </section>
    </main>
</template>

<style scoped>
* {
    -webkit-tap-highlight-color: transparent;
}

main {
    background-image: url('@/assets/backgroundFile/background_protfolio.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.about-me {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    text-align: center;
    padding: 2rem 1rem;
}

.content-wrapper {
    max-width: 800px;
    width: 100%;
    padding: 0 1rem;
}

.category {
    animation: slideIn 0.6s ease-out backwards;
    margin-bottom: 0.5rem;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.nav-label {
    background: transparent;
    border: 0;
    padding: 0;
    font-family: inherit;
    font-size: clamp(1.8rem, 5vw, 2.5rem);
    font-weight: 400;
    letter-spacing: 0.1rem;
    margin: 0.8rem 0;
    color: #1a1a1a;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    user-select: none;
    position: relative;
    display: inline-block;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

.nav-label:focus-visible,
.section-link:focus-visible {
    outline: 3px solid #1a1a1a;
    outline-offset: 5px;
}

.nav-label::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    width: 0;
    height: 2px;
    background: #1a1a1a;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform: translateX(-50%);
}

.nav-label:hover::after {
    width: 100%;
}

.description {
    max-width: 650px;
    margin: 0 auto;
    padding: 1rem;
    overflow: hidden;
}

.description p {
    font-family: 'Courier New', Courier, monospace;
    line-height: 1.5;
    font-size: clamp(0.75rem, 1.8vw, 0.85rem);
    color: #4a4a4a;
    font-weight: 400;
    margin-bottom: 1rem;
}

.contact-form {
    max-width: 520px;
    margin: 0 auto;
    padding: 1rem;
    text-align: left;
}

.contact-form > p,
.contact-form label,
.form-status {
    font-family: 'Courier New', Courier, monospace;
    color: #4a4a4a;
    font-size: 0.82rem;
}

.contact-form label { display: block; margin: 0.75rem 0; }
.contact-form input, .contact-form textarea {
    width: 100%; margin-top: 0.35rem; padding: 0.65rem;
    border: 1px solid #1a1a1a; border-radius: 4px; background: rgba(255,255,255,.72);
}
.contact-form textarea { resize: vertical; }
.section-link:disabled { cursor: wait; opacity: .65; }
.form-status { margin-top: 1rem; }
.form-status.success { color: #176b3a; }
.form-status.error { color: #9b1c1c; }

.section-link {
    display: inline-block;
    font-family: 'Courier New', Courier, monospace;
    font-size: clamp(0.7rem, 1.6vw, 0.8rem);
    color: #1a1a1a;
    text-decoration: none;
    padding: 0.4rem 0.9rem;
    border: 1px solid #1a1a1a;
    border-radius: 4px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    margin-top: 0.5rem;
    position: relative;
    overflow: hidden;
}

.section-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: #1a1a1a;
    transition: left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: -1;
}

.section-link:hover {
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.section-link:hover::before {
    left: 0;
}

.section-link:active {
    transform: translateY(0) scale(0.98);
}

.fade-enter-active {
    animation: fadeInBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-leave-active {
    animation: fadeOut 0.3s ease-out;
}

@keyframes fadeInBounce {
    0% {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }

    60% {
        opacity: 1;
        transform: translateY(5px) scale(1.02);
    }

    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
        transform: translateY(0);
    }

    to {
        opacity: 0;
        transform: translateY(-15px);
    }
}

/* Desktop and Laptop */
@media (min-width: 1024px) {
    .nav-label:hover {
        transform: scale(1.08) translateY(-3px);
        letter-spacing: 0.2rem;
    }

    .nav-label:active {
        transform: scale(0.98);
    }
}

/* Tablet */
@media (max-width: 1023px) and (min-width: 768px) {
    .about-me {
        padding: 1.5rem 1rem;
    }

    .nav-label {
        font-size: 2.2rem;
    }

    .nav-label:hover {
        transform: scale(1.05) translateY(-2px);
        letter-spacing: 0.15rem;
    }

    .description p {
        font-size: 0.8rem;
    }

    .section-link {
        font-size: 0.75rem;
    }

    .section-link:hover {
        transform: translateY(-1px);
    }
}

/* Mobile - All phones (iPhone, Samsung, Android) */
@media (max-width: 767px) {
    main {
        background-attachment: scroll;
    }

    .about-me {
        padding: 1rem 0.5rem;
    }

    .content-wrapper {
        padding: 0 0.5rem;
    }

    .category {
        margin-bottom: 0.3rem;
    }

    .nav-label {
        font-size: 1.8rem;
        letter-spacing: 0.05rem;
        margin: 0.5rem 0;
        touch-action: manipulation;
    }

    .nav-label:active {
        transform: scale(0.95);
    }

    .description {
        padding: 0.8rem;
    }

    .description p {
        font-size: 0.75rem;
        line-height: 1.5;
        margin-bottom: 0.8rem;
    }

    .section-link {
        font-size: 0.7rem;
        padding: 0.35rem 0.75rem;
        touch-action: manipulation;
    }

    .section-link:active {
        transform: scale(0.95);
        color: #fff;
    }

    .section-link:active::before {
        left: 0;
    }
}

/* Small phones */
@media (max-width: 375px) {
    .nav-label {
        font-size: 1.6rem;
    }

    .description p {
        font-size: 0.7rem;
    }

    .section-link {
        font-size: 0.65rem;
        padding: 0.3rem 0.65rem;
    }
}

/* iPhone specific optimizations */
@supports (-webkit-touch-callout: none) {
    .nav-label {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
    }

    .section-link {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
    }
}
</style>
