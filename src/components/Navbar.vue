<script setup>
import '@picocss/pico'
import githubIcon from '@/assets/icon/github.svg';
import linkedinIcon from '@/assets/icon/linkedin.svg';
import gmailIcon from '@/assets/icon/gmail.svg';
import mediumIcon from '@/assets/icon/medium.svg';
</script>

<template>
    <header class="container-fluid">
        <nav>
            <ul>
                <li>
                    <h1 class="logo">
                        <strong>RANJIT</strong>BHANDARY
                    </h1>
                </li>
            </ul>
            <ul>
                <li style="animation-delay: 0s">
                    <a href="https://github.com/Coder-Delta" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                        <img :src="githubIcon" alt="Github" class="nav-icon" />
                    </a>
                </li>
                <li style="animation-delay: 0.1s">
                    <a href="https://linkedin.com/in/ranjit-kumar-702054258" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <img :src="linkedinIcon" alt="LinkedIn" class="nav-icon" />
                    </a>
                </li>
                <li style="animation-delay: 0.2s">
                    <a href="https://medium.com/@ranjitbhandary15" target="_blank" rel="noopener noreferrer" aria-label="Medium">
                        <img :src="mediumIcon" alt="Medium" class="nav-icon" />
                    </a>
                </li>
                <li style="animation-delay: 0.3s">
                    <a href="mailto:ranjitbhandary15@gmail.com" aria-label="Email">
                        <img :src="gmailIcon" alt="Gmail" class="nav-icon" />
                    </a>
                </li>
            </ul>
        </nav>
    </header>
</template>

<style scoped>
* {
    -webkit-tap-highlight-color: transparent;
}

header {
    padding: 1.5rem 2rem;
    position: relative;
}

nav {
    height: auto;
    align-items: center;
    display: flex;
    justify-content: space-between;
}

.logo {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: clamp(1.2rem, 4vw, 1.75rem);
    font-weight: 300;
    letter-spacing: -0.5px;
    margin-bottom: 0;
    color: #000;
    text-transform: uppercase;
    line-height: 1;
    white-space: nowrap;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    animation: slideIn 0.6s ease-out backwards;
}

.logo strong {
    font-weight: 700;
    margin-right: 2px;
}

nav ul:last-child li {
    animation: slideIn 0.6s ease-out backwards;
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

nav ul:last-child a {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 4px;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
}

nav ul:last-child a::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: #1a1a1a;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform: translateX(-50%);
}

.nav-icon {
    height: clamp(24px, 5vw, 32px);
    width: auto;
    opacity: 0.5;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: block;
}

nav ul:last-child {
    gap: 0.3rem;
    margin: 0;
}

nav ul li {
    padding: 0;
    margin: 0;
}

h1 {
    --pico-typography-spacing-vertical: 0;
}

/* Desktop and Laptop */
@media (min-width: 1024px) {
    nav ul:last-child a:hover {
        transform: translateY(-3px);
    }

    nav ul:last-child a:hover::after {
        width: 80%;
    }

    .nav-icon:hover {
        opacity: 1;
    }

    nav ul:last-child a:active {
        transform: scale(0.98);
    }

    nav ul:last-child {
        gap: 0.5rem;
    }

    nav ul li {
        padding: 0 5px;
    }
}

/* Tablet */
@media (max-width: 1023px) and (min-width: 768px) {
    header {
        padding: 1.2rem 1.5rem;
    }

    .logo {
        font-size: 1.5rem;
    }

    .nav-icon {
        height: 28px;
    }

    nav ul:last-child {
        gap: 0.4rem;
    }

    nav ul:last-child a:hover {
        transform: translateY(-2px);
    }

    nav ul:last-child a:hover::after {
        width: 80%;
    }

    .nav-icon:hover {
        opacity: 1;
    }
}

/* Mobile - All phones (iPhone, Samsung, Android) */
@media (max-width: 767px) {
    header {
        padding: 1rem 1rem;
    }

    nav {
        flex-wrap: nowrap;
    }

    nav ul {
        padding: 0;
    }

    .logo {
        font-size: 1.2rem;
        letter-spacing: -0.3px;
    }

    .logo strong {
        margin-right: 1px;
    }

    nav ul:last-child {
        gap: 0.2rem;
    }

    nav ul:last-child a {
        padding: 0.4rem;
        touch-action: manipulation;
    }

    .nav-icon {
        height: 24px;
        opacity: 0.6;
    }

    nav ul:last-child a:active {
        transform: scale(0.95);
    }

    nav ul:last-child a:active .nav-icon {
        opacity: 1;
    }
}

/* Small phones */
@media (max-width: 375px) {
    header {
        padding: 0.8rem 0.8rem;
    }

    .logo {
        font-size: 1.1rem;
        letter-spacing: -0.2px;
    }

    .nav-icon {
        height: 22px;
    }

    nav ul:last-child {
        gap: 0.1rem;
    }

    nav ul:last-child a {
        padding: 0.3rem;
    }
}

/* Extra small phones */
@media (max-width: 320px) {
    .logo {
        font-size: 1rem;
    }

    .nav-icon {
        height: 20px;
    }
}

/* iPhone specific optimizations */
@supports (-webkit-touch-callout: none) {
    nav ul:last-child a {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
    }
}

/* Landscape mode on mobile */
@media (max-width: 767px) and (orientation: landscape) {
    header {
        padding: 0.8rem 1rem;
    }

    .logo {
        font-size: 1.1rem;
    }

    .nav-icon {
        height: 22px;
    }
}
</style>