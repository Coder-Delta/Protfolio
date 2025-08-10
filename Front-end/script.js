// Portfolio Backend Request Handler
// Base API URL - Update this with your actual backend URL
const API_BASE_URL = 'http://localhost:8000/api'; // Change this to your backend URL

// Utility function to make API requests
async function makeRequest(endpoint, method = 'GET', data = null) {
    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// Show loading state
function showLoading(element) {
    const originalText = element.textContent;
    element.textContent = 'Loading...';
    element.disabled = true;
    return originalText;
}

// Hide loading state
function hideLoading(element, originalText) {
    element.textContent = originalText;
    element.disabled = false;
}

// Navigation handlers
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const section = e.target.textContent.trim().toLowerCase();
            
            // Remove active class from all links
            navLinks.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked link
            e.target.classList.add('active');
            
            try {
                // Send navigation tracking request to backend
                await makeRequest('/analytics/navigation', 'POST', {
                    section: section,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                });
                
                console.log(`Navigation to ${section} tracked`);
                
                // Handle section-specific requests
                switch(section) {
                    case 'home':
                        await loadHomeContent();
                        break;
                    case 'skills':
                        await loadSkills();
                        break;
                    case 'education':
                        await loadEducation();
                        break;
                    case 'projects':
                        await loadProjects();
                        break;
                }
                
            } catch (error) {
                console.error(`Failed to track navigation to ${section}:`, error);
            }
        });
    });
}

// Load home content
async function loadHomeContent() {
    try {
        const homeData = await makeRequest('/content/home');
        // Update home content dynamically if needed
        console.log('Home content loaded:', homeData);
    } catch (error) {
        console.error('Failed to load home content:', error);
    }
}

// Load skills data
async function loadSkills() {
    try {
        const skills = await makeRequest('/content/skills');
        console.log('Skills loaded:', skills);
        // You can update the UI here with the skills data
    } catch (error) {
        console.error('Failed to load skills:', error);
    }
}

// Load education data
async function loadEducation() {
    try {
        const education = await makeRequest('/content/education');
        console.log('Education loaded:', education);
        // You can update the UI here with the education data
    } catch (error) {
        console.error('Failed to load education:', error);
    }
}

// Load projects data
async function loadProjects() {
    try {
        const projects = await makeRequest('/content/projects');
        console.log('Projects loaded:', projects);
        // You can update the UI here with the projects data
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

// Social media handlers
function setupSocialMedia() {
    const socialLinks = document.querySelectorAll('.social-icons a');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const platform = getSocialPlatform(link);
            
            try {
                // Track social media click
                await makeRequest('/analytics/social-click', 'POST', {
                    platform: platform,
                    timestamp: new Date().toISOString(),
                    referrer: window.location.href
                });
                
                // Get the actual social media URL from backend
                const socialData = await makeRequest(`/social/${platform}`);
                
                if (socialData && socialData.url) {
                    // Open the social media link in new tab
                    window.open(socialData.url, '_blank');
                } else {
                    console.log(`No URL configured for ${platform}`);
                }
                
            } catch (error) {
                console.error(`Failed to handle ${platform} click:`, error);
                // Fallback - you can set default URLs here
                handleSocialFallback(platform);
            }
        });
    });
}

// Get social platform name from icon class
function getSocialPlatform(linkElement) {
    const icon = linkElement.querySelector('i');
    const classes = icon.className;
    
    if (classes.includes('linkedin')) return 'linkedin';
    if (classes.includes('github')) return 'github';
    if (classes.includes('twitter') || classes.includes('x-twitter')) return 'twitter';
    if (classes.includes('instagram')) return 'instagram';
    
    return 'unknown';
}

// Fallback for social media links
function handleSocialFallback(platform) {
    const fallbackUrls = {
        linkedin: 'https://linkedin.com/in/ranjit', // Update with your actual LinkedIn
        github: 'https://github.com/ranjit', // Update with your actual GitHub
        twitter: 'https://twitter.com/ranjit', // Update with your actual Twitter
        instagram: 'https://instagram.com/ranjit' // Update with your actual Instagram
    };
    
    if (fallbackUrls[platform]) {
        window.open(fallbackUrls[platform], '_blank');
    }
}

// Resume download handler
function setupResumeDownload() {
    const resumeBtn = document.querySelector('.btn');
    
    if (resumeBtn) {
        resumeBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const originalText = showLoading(resumeBtn);
            
            try {
                // Track resume download request
                await makeRequest('/analytics/resume-download', 'POST', {
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    referrer: window.location.href
                });
                
                // Get resume download URL from backend
                const resumeData = await makeRequest('/resume/download');
                
                if (resumeData && resumeData.downloadUrl) {
                    // Create temporary link and trigger download
                    const link = document.createElement('a');
                    link.href = resumeData.downloadUrl;
                    link.download = resumeData.filename || 'Ranjit_Resume.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    console.log('Resume download initiated');
                } else {
                    throw new Error('No download URL received');
                }
                
            } catch (error) {
                console.error('Failed to download resume:', error);
                alert('Sorry, unable to download resume at the moment. Please try again later.');
            } finally {
                hideLoading(resumeBtn, originalText);
            }
        });
    }
}

// Contact form handler (if you add a contact section later)
function setupContactForm() {
    const contactForm = document.querySelector('#contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const contactData = Object.fromEntries(formData);
            
            try {
                const result = await makeRequest('/contact/submit', 'POST', contactData);
                
                if (result.success) {
                    alert('Message sent successfully!');
                    contactForm.reset();
                } else {
                    throw new Error(result.message || 'Failed to send message');
                }
                
            } catch (error) {
                console.error('Failed to send contact message:', error);
                alert('Failed to send message. Please try again later.');
            }
        });
    }
}

// Page view tracking
async function trackPageView() {
    try {
        await makeRequest('/analytics/page-view', 'POST', {
            page: 'home',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        });
        
        console.log('Page view tracked');
    } catch (error) {
        console.error('Failed to track page view:', error);
    }
}

// Typing animation handler (if you want to load typing texts from backend)
async function setupTypingAnimation() {
    try {
        const typingData = await makeRequest('/content/typing-texts');
        
        if (typingData && typingData.texts) {
            // Update your typing animation with the texts from backend
            console.log('Typing texts loaded:', typingData.texts);
        }
    } catch (error) {
        console.error('Failed to load typing texts:', error);
        // Use default texts
    }
}

// Error handling for network issues
window.addEventListener('online', () => {
    console.log('Connection restored');
});

window.addEventListener('offline', () => {
    console.log('Connection lost - some features may not work');
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio JS initialized');
    
    // Setup all handlers
    setupNavigation();
    setupSocialMedia();
    setupResumeDownload();
    setupContactForm();
    setupTypingAnimation();
    
    // Track initial page view
    trackPageView();
});

// Export functions for testing or external use
window.portfolioAPI = {
    makeRequest,
    trackPageView,
    loadSkills,
    loadEducation,
    loadProjects
};