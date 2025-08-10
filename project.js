// Portfolio project links handler
document.addEventListener('DOMContentLoaded', function() {
    // Get all project link buttons
    const projectLinks = document.querySelectorAll('.project-link');
    
    // Add click event listeners to all project links
    projectLinks.forEach(link => {
        link.addEventListener('click', handleProjectLinkClick);
    });
});

async function handleProjectLinkClick(event) {
    event.preventDefault(); // Prevent default link behavior
    
    const linkElement = event.target;
    const linkText = linkElement.textContent.trim();
    const projectCard = linkElement.closest('.project-card');
    const projectTitle = projectCard.querySelector('.project-title').textContent.trim();
    
    // Show loading state
    const originalText = linkElement.textContent;
    linkElement.textContent = 'Loading...';
    linkElement.classList.add('loading');
    
    try {
        let endpoint = '';
        let requestData = {
            projectName: projectTitle,
            linkType: linkText
        };
        
        // Determine endpoint based on link type
        switch(linkText.toLowerCase()) {
            case 'live demo':
                endpoint = '/api/projects/demo';
                break;
            case 'github':
                endpoint = '/api/projects/github';
                break;
            case 'app store':
                endpoint = '/api/projects/appstore';
                break;
            default:
                endpoint = '/api/projects/link';
        }
        
        // Make API request to backend
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle the response data
        handleProjectResponse(data, linkText, projectTitle);
        
    } catch (error) {
        console.error('Error fetching project data:', error);
        showErrorMessage(`Failed to load ${linkText.toLowerCase()} for ${projectTitle}`);
    } finally {
        // Restore original button state
        linkElement.textContent = originalText;
        linkElement.classList.remove('loading');
    }
}

function handleProjectResponse(data, linkType, projectTitle) {
    console.log('Received data for', projectTitle, ':', data);
    
    if (data.url) {
        // If backend returns a URL, open it
        window.open(data.url, '_blank');
    } else if (data.redirect) {
        // If backend wants to redirect
        window.location.href = data.redirect;
    } else if (data.message) {
        // Show message from backend
        showSuccessMessage(data.message);
    } else {
        // Handle other response data
        displayProjectData(data, linkType, projectTitle);
    }
}

function displayProjectData(data, linkType, projectTitle) {
    // Create and show modal with project data
    const modal = createModal(projectTitle, linkType, data);
    document.body.appendChild(modal);
    modal.classList.add('show');
    
    // Close modal when clicking outside or on close button
    modal.addEventListener('click', function(e) {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
            closeModal(modal);
        }
    });
}

function createModal(projectTitle, linkType, data) {
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${projectTitle} - ${linkType}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${formatProjectData(data)}
            </div>
            <div class="modal-footer">
                <button class="modal-close btn">Close</button>
            </div>
        </div>
    `;
    
    return modal;
}

function formatProjectData(data) {
    let html = '';
    
    if (data.description) {
        html += `<p><strong>Description:</strong> ${data.description}</p>`;
    }
    
    if (data.technologies && Array.isArray(data.technologies)) {
        html += `<p><strong>Technologies:</strong> ${data.technologies.join(', ')}</p>`;
    }
    
    if (data.features && Array.isArray(data.features)) {
        html += '<p><strong>Features:</strong></p><ul>';
        data.features.forEach(feature => {
            html += `<li>${feature}</li>`;
        });
        html += '</ul>';
    }
    
    if (data.status) {
        html += `<p><strong>Status:</strong> ${data.status}</p>`;
    }
    
    if (data.lastUpdated) {
        html += `<p><strong>Last Updated:</strong> ${new Date(data.lastUpdated).toLocaleDateString()}</p>`;
    }
    
    // Handle any additional data
    Object.keys(data).forEach(key => {
        if (!['description', 'technologies', 'features', 'status', 'lastUpdated', 'url', 'redirect', 'message'].includes(key)) {
            html += `<p><strong>${key}:</strong> ${data[key]}</p>`;
        }
    });
    
    return html || '<p>No additional information available.</p>';
}

function closeModal(modal) {
    modal.classList.add('fade-out');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

function showSuccessMessage(message) {
    showNotification(message, 'success');
}

function showErrorMessage(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Alternative function for handling specific project types
function handleSpecificProject(projectName, linkType) {
    const handlers = {
        'Chat WebApp': {
            'Live Demo': () => fetchChatAppDemo(),
            'GitHub': () => fetchChatAppRepo()
        },
        'Mobile Weather WebApp': {
            'App Store': () => fetchWeatherAppStore(),
            'GitHub': () => fetchWeatherAppRepo()
        },
        'Portfolio Website': {
            'Live Demo': () => fetchPortfolioDemo(),
            'GitHub': () => fetchPortfolioRepo()
        }
    };
    
    if (handlers[projectName] && handlers[projectName][linkType]) {
        return handlers[projectName][linkType]();
    }
    
    return null;
}

// Specific project handlers
async function fetchChatAppDemo() {
    return await fetch('/api/projects/chat-app/demo', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json());
}

async function fetchChatAppRepo() {
    return await fetch('/api/projects/chat-app/github', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json());
}

async function fetchWeatherAppStore() {
    return await fetch('/api/projects/weather-app/store', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json());
}

async function fetchWeatherAppRepo() {
    return await fetch('/api/projects/weather-app/github', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json());
}

async function fetchPortfolioDemo() {
    return await fetch('/api/projects/portfolio/demo', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json());
}

async function fetchPortfolioRepo() {
    return await fetch('/api/projects/portfolio/github', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json());
}