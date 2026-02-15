<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '@/components/Navbar.vue';
import '@picocss/pico';

const projects = ref([
    {
        title: 'VideoTube Backend',
        description: 'A complex playstation backend project. Built with modern technologies to handle video uploads, processing, and streaming efficiently.',
        link: 'https://github.com/Coder-Delta/videotube_backend',
        image: 'https://opengraph.githubassets.com/1/Coder-Delta/videotube_backend'
    },
    {
        title: 'VideoTube Frontend',
        description: 'It is frontend part of my chaiAurBackend project. Modern video streaming interface built with Vue.js.',
        link: 'https://github.com/Coder-Delta/videotube-frontend',
        image: 'https://opengraph.githubassets.com/1/Coder-Delta/videotube-frontend'
    },
    {
        title: 'Signal',
        description: 'It is a backend project of django a simple blog app with some protection. Secure and efficient blog management system.',
        link: 'https://github.com/Coder-Delta/Signal',
        image: 'https://opengraph.githubassets.com/1/Coder-Delta/Signal'
    },
    {
        title: 'Doot',
        description: 'A chat application with optimization. Real-time messaging platform built for performance and scalability.',
        link: 'https://github.com/Coder-Delta/Doot',
        image: 'https://opengraph.githubassets.com/1/Coder-Delta/Doot'
    },
    {
        title: 'VerifyX',
        description: 'It is a simple email and phone number verification system using Upstash Redis as a database to store verification codes.',
        link: 'https://github.com/Coder-Delta/VerifyX',
        image: 'https://opengraph.githubassets.com/1/Coder-Delta/VerifyX'
    },
    {
        title: 'BigV',
        description: 'It\'s a system based on Work Queue. Efficient task management and queue processing system.',
        link: 'https://github.com/Coder-Delta/BigV',
        image: 'https://opengraph.githubassets.com/1/Coder-Delta/BigV'
    }
]);

onMounted(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
});
</script>

<template>
    <main>
        <Navbar />
        <section class="container projects-section">
            <div class="content-wrapper">
                <h1 class="page-title">PROJECTS</h1>
                
                <div class="projects-grid">
                    <article 
                        v-for="(project, index) in projects" 
                        :key="index"
                        class="project-card"
                        :style="{ animationDelay: `${index * 0.1}s` }"
                    >
                        <div class="project-photo">
                            <img 
                                :src="project.image" 
                                :alt="project.title"
                                loading="lazy"
                            />
                        </div>
                        
                        <div class="project-details">
                            <h2 class="project-title">{{ project.title }}</h2>
                            <p class="project-description">{{ project.description }}</p>
                            <a 
                                :href="project.link" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                class="project-link"
                            >
                                Visit Project →
                            </a>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    </main>
</template>

<style scoped>
* {
    -webkit-tap-highlight-color: transparent;
}

html {
    scroll-behavior: smooth;
}

main {
    background-image: url('@/assets/backgroundFile/background_protfolio.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    scroll-behavior: smooth;
}

.projects-section {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-grow: 1;
    padding: 2rem 1rem;
}

.content-wrapper {
    max-width: 1400px;
    width: 100%;
    padding: 0 1rem;
}

.page-title {
    font-size: clamp(2.5rem, 6vw, 3.5rem);
    font-weight: 400;
    letter-spacing: 0.15rem;
    margin-bottom: 3rem;
    color: #1a1a1a;
    text-align: center;
    animation: slideIn 0.6s ease-out backwards;
}

.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
    gap: 2.5rem;
    width: 100%;
}

.project-card {
    display: flex;
    flex-direction: column;
    animation: slideIn 0.6s ease-out backwards;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 2px solid #1a1a1a;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.project-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
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

.project-photo {
    width: 100%;
    height: 320px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 2px solid #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    padding: 1rem;
}

.project-photo::before {
    content: 'Photo';
    font-size: 2.5rem;
    font-weight: 300;
    color: rgba(26, 26, 26, 0.15);
    letter-spacing: 0.1rem;
    position: absolute;
    z-index: 0;
}

.project-photo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    position: relative;
    z-index: 1;
    border-radius: 8px;
}

.project-details {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    text-align: center;
    flex-grow: 1;
    justify-content: space-between;
}

.project-title {
    font-size: clamp(1.6rem, 3vw, 2rem);
    font-weight: 400;
    letter-spacing: 0.1rem;
    margin: 0 0 1rem 0;
    color: #1a1a1a;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

.project-description {
    font-family: 'Courier New', Courier, monospace;
    line-height: 1.7;
    font-size: clamp(0.8rem, 1.5vw, 0.9rem);
    color: #4a4a4a;
    font-weight: 400;
    margin-bottom: 1.5rem;
    flex-grow: 1;
}

.project-link {
    display: inline-block;
    font-family: 'Courier New', Courier, monospace;
    font-size: clamp(0.75rem, 1.4vw, 0.85rem);
    color: #1a1a1a;
    text-decoration: none;
    padding: 0.6rem 1.4rem;
    border: 1px solid #1a1a1a;
    border-radius: 4px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
    align-self: center;
}

.project-link::before {
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

.project-link:hover {
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.project-link:hover::before {
    left: 0;
}

.project-link:active {
    transform: translateY(0) scale(0.98);
}

/* Custom Scrollbar */
main::-webkit-scrollbar {
    width: 10px;
}

main::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
}

main::-webkit-scrollbar-thumb {
    background: rgba(26, 26, 26, 0.5);
    border-radius: 5px;
    transition: background 0.3s ease;
}

main::-webkit-scrollbar-thumb:hover {
    background: rgba(26, 26, 26, 0.7);
}

/* Tablet */
@media (max-width: 1023px) {
    .projects-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .project-photo {
        height: 280px;
    }

    .project-details {
        padding: 1.5rem;
    }
}

/* Mobile - All phones */
@media (max-width: 767px) {
    main {
        background-attachment: scroll;
    }

    .projects-section {
        padding: 1rem 0.5rem;
    }

    .content-wrapper {
        padding: 0 0.5rem;
    }

    .page-title {
        font-size: 2rem;
        margin-bottom: 2rem;
    }

    .projects-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .project-photo {
        height: 240px;
        padding: 0.8rem;
    }

    .project-details {
        padding: 1.5rem 1rem;
    }

    .project-title {
        font-size: 1.5rem;
        margin-bottom: 0.8rem;
    }

    .project-description {
        font-size: 0.8rem;
        line-height: 1.6;
        margin-bottom: 1.2rem;
    }

    .project-link {
        font-size: 0.75rem;
        padding: 0.5rem 1.2rem;
        touch-action: manipulation;
    }

    .project-link:active {
        transform: scale(0.95);
        color: #fff;
    }

    .project-link:active::before {
        left: 0;
    }

    /* Hide scrollbar on mobile */
    main::-webkit-scrollbar {
        display: none;
    }
}

/* Small phones */
@media (max-width: 375px) {
    .page-title {
        font-size: 1.8rem;
    }

    .project-photo {
        height: 200px;
        padding: 0.5rem;
    }

    .project-details {
        padding: 1.2rem 0.8rem;
    }

    .project-title {
        font-size: 1.3rem;
    }

    .project-description {
        font-size: 0.75rem;
    }

    .project-link {
        font-size: 0.7rem;
        padding: 0.45rem 1rem;
    }
}

/* iPhone specific optimizations */
@supports (-webkit-touch-callout: none) {
    .project-link {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
    }
    
    main {
        -webkit-overflow-scrolling: touch;
    }
}

/* Firefox */
* {
    scrollbar-width: thin;
    scrollbar-color: rgba(26, 26, 26, 0.5) transparent;
}
</style>