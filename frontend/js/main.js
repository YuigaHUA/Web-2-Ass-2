// Common utility functions and configuration
const CONFIG = {
    API_BASE: 'http://localhost:3000/api/events',
    DEBUG: true
};

// Common utility class
class CharityEventsApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalErrorHandling();
        this.setupLoadingStates();
        this.log('Charity Events App initialized');
    }

    // API request wrapper
    async apiRequest(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            this.showLoading();
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            this.handleError('API Request Failed', error);
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    // Error handling
    handleError(context, error) {
        console.error(`🚨 ${context}:`, error);
        
        // Show user-friendly error message
        this.showNotification(error.message || 'Something went wrong. Please try again.', 'error');
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            background: type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '9999',
            maxWidth: '400px',
            animation: 'slideInRight 0.3s ease'
        });

        // Close button
        notification.querySelector('.notification-close').onclick = () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        };

        document.body.appendChild(notification);

        // Auto dismiss
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Loading state management
    showLoading() {
        // Can implement global loading indicator when needed
    }

    hideLoading() {
        // Hide global loading indicator
    }

    // Setup global error handling
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.handleError('Global Error', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Unhandled Promise Rejection', event.reason);
        });
    }

    // Setup loading states
    setupLoadingStates() {
        // Can add global loading state management
    }

    // Utility function: Format date
    formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return new Date(dateString).toLocaleDateString('en-AU', options);
    }

    // Utility function: Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
        }).format(amount);
    }

    // Utility function: Calculate progress percentage
    calculateProgress(current, goal) {
        if (!goal || goal === 0) return 0;
        return Math.min((current / goal) * 100, 100);
    }

    // Debug logging
    log(message, data = null) {
        if (CONFIG.DEBUG) {
            console.log(`🔍 ${message}`, data || '');
        }
    }

    // Get URL parameter
    getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Set page title
    setPageTitle(title) {
        document.title = `${title} - Hope Foundation`;
    }
}

// Initialize application
const charityApp = new CharityEventsApp();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: 1rem;
    }
`;
document.head.appendChild(style);