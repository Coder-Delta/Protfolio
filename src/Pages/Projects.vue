<script setup>
import { computed, reactive, ref } from 'vue';
import Navbar from '@/components/Navbar.vue';
import '@picocss/pico';

const rawProjects = [
    {
        repo: 'videotube_backend',
        title: 'VideoTube Backend',
        description: 'Backend for a video platform with uploads, processing, auth, and streaming-focused APIs.',
        featured: true
    },
    {
        repo: 'videotube-frontend',
        title: 'VideoTube Frontend',
        description: 'Vue frontend for the VideoTube platform with a polished streaming-style interface.',
        featured: true
    },
    {
        repo: 'LectureLog_backend',
        title: 'LectureLog Backend',
        description: 'Backend system for LectureLog, designed to manage learning workflows and academic data.',
        featured: true
    },
    {
        repo: 'BigV',
        title: 'BigV',
        description: 'Work queue based system focused on task distribution and backend processing.',
        featured: true
    },
    {
        repo: 'Signal',
        title: 'Signal',
        description: 'Django blog backend with protection-focused features and content management flows.',
        featured: true
    },
    {
        repo: 'Doot',
        title: 'Doot',
        description: 'Chat application built around real-time messaging and a cleaner communication experience.',
        featured: true
    },
    {
        repo: 'VerifyX',
        title: 'VerifyX',
        description: 'Email and phone verification system using Upstash Redis for secure code handling.',
        featured: true
    },
    {
        repo: 'titan',
        title: 'Titan',
        description: 'High-performance reverse proxy and security gateway written in Zig.',
        featured: true
    },
    {
        repo: 'Real_Estate_AI_Agent',
        title: 'Real Estate AI Agent',
        description: 'AI agent project built to automate client scheduling and meeting coordination.',
        featured: false
    },
    {
        repo: 'Drug-Solubilitoo',
        title: 'Drug Solubilitoo',
        description: 'Pharma-focused project around solubility prediction as part of ADMET analysis workflows.',
        featured: false
    },
    {
        repo: 'Code-Runner',
        title: 'Code Runner',
        description: 'Universal code runner for 35+ languages, created for the Zed editor ecosystem.',
        featured: false
    },
    {
        repo: 'Choco',
        title: 'Choco',
        description: 'AI-integrated 2D virtual avatar project exploring interactive assistant experiences.',
        featured: false
    },
    {
        repo: 'Weather_app',
        title: 'Weather App',
        description: 'Weather web app for checking forecast details through a simple frontend flow.',
        featured: false
    },
    {
        repo: 'dna-mutation-env',
        title: 'DNA Mutation Env',
        description: 'Open-ended reinforcement learning environment centered on DNA mutation experiments.',
        featured: false
    },
    {
        repo: 'Door_Of_Reality',
        title: 'Door Of Reality',
        description: 'Game discovery platform concept for browsing and exploring titles in one place.',
        featured: false
    },
    {
        repo: 'TodoListVueJS',
        title: 'Todo List VueJS',
        description: 'Basic Vue todo list project with simple task tracking interactions.',
        featured: false
    },
    {
        repo: 'Vue_Quote_Generator',
        title: 'Vue Quote Generator',
        description: 'Mini Vue project that generates and displays quotes in a lightweight UI.',
        featured: false
    },
    {
        repo: 'Qr_Genarator',
        title: 'QR Generator',
        description: 'Small utility project for generating QR codes from user input.',
        featured: false
    },
    {
        repo: 'Billboard_project',
        title: 'Billboard Project',
        description: 'Hackathon project built around the Tech Nova event idea.',
        featured: false
    },
    {
        repo: 'Collage_canteen',
        title: 'College Canteen',
        description: 'Hackathon project for a college canteen workflow and ordering experience.',
        featured: false
    },
    {
        repo: 'Todo-list',
        title: 'Todo List',
        description: 'Simple HTML, CSS, and JavaScript todo list built as a lightweight practice project.',
        featured: false
    }
];

const projects = ref(
    rawProjects.map((project) => ({
        ...project,
        link: `https://github.com/Coder-Delta/${project.repo}`,
        image: `https://opengraph.githubassets.com/1/Coder-Delta/${project.repo}`
    }))
);

const itemsPerPage = 4;
const currentPage = ref(1);
const imageState = reactive(
    Object.fromEntries(
        projects.value.map((project) => [
            project.title,
            { loaded: false, error: false }
        ])
    )
);

const totalPages = computed(() => Math.ceil(projects.value.length / itemsPerPage));
const paginatedProjects = computed(() => {
    const sortedProjects = [...projects.value].sort((left, right) => {
        if (left.featured === right.featured) {
            return 0;
        }

        return left.featured ? -1 : 1;
    });
    const start = (currentPage.value - 1) * itemsPerPage;
    return sortedProjects.slice(start, start + itemsPerPage);
});

const changePage = (page) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value) {
        return;
    }

    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const markImageLoaded = (title) => {
    imageState[title].loaded = true;
};

const markImageError = (title) => {
    imageState[title].loaded = false;
    imageState[title].error = true;
};
</script>

<template>
    <main>
        <Navbar />
        <section class="container projects-section">
            <div class="content-wrapper">
                <h1 class="page-title">PROJECTS</h1>

                <div class="projects-grid">
                    <article
                        v-for="(project, index) in paginatedProjects"
                        :key="project.title"
                        class="project-card"
                        :style="{ animationDelay: `${index * 0.1}s` }"
                    >
                        <div
                            class="project-photo"
                            :class="{
                                'is-loaded': imageState[project.title].loaded,
                                'has-error': imageState[project.title].error
                            }"
                        >
                            <div v-if="!imageState[project.title].loaded && !imageState[project.title].error" class="image-loader">
                                <span>Loading preview...</span>
                            </div>

                            <div v-if="imageState[project.title].error" class="image-fallback">
                                <span>Preview unavailable</span>
                                <small>Open the repository to view details.</small>
                            </div>

                            <img
                                :src="project.image"
                                :alt="project.title"
                                loading="lazy"
                                decoding="async"
                                :class="{ visible: imageState[project.title].loaded }"
                                @load="markImageLoaded(project.title)"
                                @error="markImageError(project.title)"
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

                <nav v-if="totalPages > 1" class="pagination" aria-label="Projects pages">
                    <button
                        class="pagination-button"
                        type="button"
                        :disabled="currentPage === 1"
                        @click="changePage(currentPage - 1)"
                    >
                        Previous
                    </button>

                    <button
                        v-for="page in totalPages"
                        :key="page"
                        class="pagination-button"
                        type="button"
                        :class="{ active: currentPage === page }"
                        @click="changePage(page)"
                    >
                        {{ page }}
                    </button>

                    <button
                        class="pagination-button"
                        type="button"
                        :disabled="currentPage === totalPages"
                        @click="changePage(currentPage + 1)"
                    >
                        Next
                    </button>
                </nav>
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
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0) 80%);
    transform: translateX(-100%);
    animation: shimmer 1.6s ease-in-out infinite;
    z-index: 0;
}

.project-photo.is-loaded::before,
.project-photo.has-error::before {
    display: none;
}

.image-loader,
.image-fallback {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 0.35rem;
    padding: 1rem;
    color: rgba(26, 26, 26, 0.72);
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.85rem;
    letter-spacing: 0.04rem;
}

.image-fallback small {
    font-size: 0.72rem;
}

.project-photo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    position: relative;
    z-index: 2;
    border-radius: 8px;
    opacity: 0;
    transform: scale(0.98);
    transition: opacity 0.45s ease, transform 0.45s ease;
}

.project-photo img.visible {
    opacity: 1;
    transform: scale(1);
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

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    margin-top: 2.5rem;
    flex-wrap: wrap;
}

.pagination-button {
    min-width: 48px;
    border: 1px solid #1a1a1a;
    background: rgba(255, 255, 255, 0.82);
    color: #1a1a1a;
    border-radius: 999px;
    padding: 0.55rem 1rem;
    font-family: 'Courier New', Courier, monospace;
    transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease, opacity 0.25s ease;
}

.pagination-button:hover:not(:disabled),
.pagination-button.active {
    background: #1a1a1a;
    color: #fff;
    transform: translateY(-2px);
}

.pagination-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

@keyframes shimmer {
    to {
        transform: translateX(100%);
    }
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
        grid-template-columns: minmax(0, 1fr);
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

    .pagination {
        gap: 0.5rem;
        margin-top: 2rem;
    }

    .pagination-button {
        padding: 0.5rem 0.9rem;
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
