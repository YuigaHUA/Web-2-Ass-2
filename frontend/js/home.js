// Home page functionality for Charity Events Platform
const API_BASE = 'http://localhost:3000/api/events';

class HomePage {
    constructor() {
        this.featuredEvents = [];
        this.allEvents = [];
        this.categories = [];
        this.currentFilter = 'all';
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.displayContent();
        } catch (error) {
            this.handleError('Home page initialization failed', error);
        }
    }

    async loadData() {
        try {
            // Load all data in parallel
            const [eventsData, categoriesData, featuredData] = await Promise.all([
                this.apiRequest('/'),
                this.apiRequest('/categories'),
                this.apiRequest('/featured')
            ]);

            this.allEvents = eventsData.data.upcoming_events || [];
            this.featuredEvents = featuredData.data || [];
            this.categories = categoriesData.data || [];

            console.log('Data loaded successfully', {
                events: this.allEvents.length,
                featured: this.featuredEvents.length,
                categories: this.categories.length
            });

        } catch (error) {
            throw new Error('Failed to load home page data');
        }
    }

    // API request helper
    async apiRequest(endpoint) {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    setupEventListeners() {
        // Filter buttons event
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });

        // Category cards click event
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-card')) {
                const categoryCard = e.target.closest('.category-card');
                const categoryName = categoryCard.querySelector('h3').textContent;
                this.handleCategoryClick(categoryName);
            }
        });
    }

    handleFilterChange(filter) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.currentFilter = filter;
        this.displayEvents();
    }

    handleCategoryClick(categoryName) {
        // Redirect to search page with pre-selected category
        const category = this.categories.find(cat => cat.name === categoryName);
        if (category) {
            window.location.href = `search.html?category=${category.id}`;
        }
    }

    displayContent() {
        this.displayFeaturedEvents();
        this.displayEvents();
        this.displayCategories();
        this.hideLoading();
    }

    displayFeaturedEvents() {
        const container = document.getElementById('featured-container');
        
        if (this.featuredEvents.length === 0) {
            container.innerHTML = this.createNoEventsMessage('featured');
            return;
        }

        container.innerHTML = this.featuredEvents.map(event => 
            this.createEventCard(event, true)
        ).join('');
    }

    displayEvents() {
        const container = document.getElementById('events-container');
        
        let eventsToShow = this.allEvents;

        // Apply filters
        switch (this.currentFilter) {
            case 'featured':
                eventsToShow = eventsToShow.filter(event => event.is_featured);
                break;
            case 'upcoming':
                // Already showing upcoming events
                break;
            case 'all':
            default:
                // Show all events
                break;
        }

        if (eventsToShow.length === 0) {
            container.innerHTML = this.createNoEventsMessage(this.currentFilter);
            return;
        }

        container.innerHTML = eventsToShow.map(event => 
            this.createEventCard(event)
        ).join('');
    }

    displayCategories() {
        const container = document.getElementById('categories-container');
        
        if (this.categories.length === 0) {
            container.innerHTML = '<p>No categories available</p>';
            return;
        }

        // Assign icons to each category
        const categoryIcons = {
            'Gala Dinner': 'fa-utensils',
            'Fun Run/Walk': 'fa-running',
            'Silent Auction': 'fa-gavel',
            'Charity Concert': 'fa-music',
            'Community Workshop': 'fa-chalkboard-teacher',
            'Food Festival': 'fa-utensils',
            'Art Exhibition': 'fa-palette',
            'Sports Tournament': 'fa-trophy'
        };

        container.innerHTML = this.categories.map(category => `
            <div class="category-card" data-category-id="${category.id}">
                <div class="category-icon">
                    <i class="fas ${categoryIcons[category.name] || 'fa-heart'}"></i>
                </div>
                <h3>${category.name}</h3>
                <p>${category.description || 'Explore events in this category'}</p>
            </div>
        `).join('');
    }

    createEventCard(event, isFeatured = false) {
        const progressPercentage = this.calculateProgress(
            event.current_amount, 
            event.goal_amount
        );

        const formattedDate = this.formatDate(event.event_date);
        const formattedPrice = event.is_free ? 
            'FREE' : this.formatCurrency(event.ticket_price);

        return `
            <div class="event-card ${isFeatured || event.is_featured ? 'featured' : ''}">
                <div class="event-image">
                    <div class="event-image-content">
                        <div class="event-category">${event.category_name}</div>
                        <div class="event-date">${formattedDate}</div>
                    </div>
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-meta">
                        <p><i class="fas fa-map-marker-alt"></i> ${event.venue_name}, ${event.location}</p>
                        <p><i class="fas fa-clock"></i> ${event.event_time}</p>
                        <p><i class="fas fa-tag"></i> ${formattedPrice}</p>
                    </div>
                    <p class="event-description">${event.short_description}</p>
                    
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>Raised: ${this.formatCurrency(event.current_amount)}</span>
                        <span>${progressPercentage.toFixed(1)}%</span>
                    </div>
                    
                    <div class="event-actions">
                        <a href="event-details.html?id=${event.id}" class="btn btn-primary">
                            <i class="fas fa-info-circle"></i>
                            View Details
                        </a>
                        <span class="event-organization">${event.organization_name}</span>
                    </div>
                </div>
            </div>
        `;
    }

    createNoEventsMessage(filterType) {
        const messages = {
            featured: 'No featured events at the moment. Check back soon!',
            upcoming: 'No upcoming events scheduled. Please check our search page for other events.',
            all: 'No events available at the moment. Please check back later.'
        };

        return `
            <div class="no-results">
                <i class="fas fa-calendar-times fa-3x" style="color: #bdc3c7; margin-bottom: 1rem;"></i>
                <h3>No Events Found</h3>
                <p>${messages[filterType] || messages.all}</p>
                <a href="search.html" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-search"></i>
                    Search All Events
                </a>
            </div>
        `;
    }

    // Utility functions
    calculateProgress(current, goal) {
        if (!goal || goal === 0) return 0;
        return Math.min((current / goal) * 100, 100);
    }

    formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return new Date(dateString).toLocaleDateString('en-AU', options);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
        }).format(amount);
    }

    hideLoading() {
        const loadingElement = document.getElementById('loading-message');
        const errorElement = document.getElementById('error-message');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'none';
    }

    handleError(context, error) {
        console.error(`Error: ${context}`, error);
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Something went wrong</h3>
                <p>Failed to load events. Please try again later.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-redo"></i>
                    Try Again
                </button>
            `;
            errorElement.style.display = 'block';
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    new HomePage();
});