// Search page functionality for Charity Events Platform
const API_BASE = 'http://localhost:3000/api/events';

class SearchPage {
    constructor() {
        this.categories = [];
        this.searchResults = [];
        this.currentSearchParams = {};
        
        this.init();
    }

    async init() {
        try {
            await this.loadCategories();
            this.setupEventListeners();
            this.setupInitialSearch();
        } catch (error) {
            this.handleError('Search page initialization failed', error);
        }
    }

    async loadCategories() {
        try {
            const response = await fetch(`${API_BASE}/categories`);
            if (!response.ok) throw new Error('Failed to load categories');
            
            const data = await response.json();
            this.categories = data.data;
            this.populateCategoryFilter();
        } catch (error) {
            throw new Error('Failed to load categories');
        }
    }

    populateCategoryFilter() {
        const categorySelect = document.getElementById('category');
        
        categorySelect.innerHTML = `
            <option value="all">All Categories</option>
            ${this.categories.map(category => `
                <option value="${category.id}">${category.name}</option>
            `).join('')}
        `;
    }

    setupEventListeners() {
        const searchForm = document.getElementById('searchForm');
        const clearBtn = document.getElementById('clearBtn');

        searchForm.addEventListener('submit', (e) => this.handleSearch(e));
        clearBtn.addEventListener('click', () => this.clearFilters());
    }

    setupInitialSearch() {
        // Check URL parameters for initial search
        const urlParams = new URLSearchParams(window.location.search);
        const urlCategory = urlParams.get('category');
        const urlLocation = urlParams.get('location');
        const urlDate = urlParams.get('date');

        if (urlCategory || urlLocation || urlDate) {
            // Set form values
            if (urlCategory) {
                document.getElementById('category').value = urlCategory;
            }
            if (urlLocation) {
                document.getElementById('location').value = urlLocation;
            }
            if (urlDate) {
                document.getElementById('date').value = urlDate;
            }
            
            // Perform search
            this.performSearch({
                category: urlCategory,
                location: urlLocation,
                date: urlDate
            });
        }
    }

    async handleSearch(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const searchParams = {
            category: formData.get('category'),
            location: formData.get('location'),
            date: formData.get('date')
        };

        this.showLoading();
        await this.performSearch(searchParams);
    }

    async performSearch(searchParams) {
        try {
            this.currentSearchParams = searchParams;
            
            // Build query string
            const queryString = new URLSearchParams();
            Object.entries(searchParams).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    queryString.append(key, value);
                }
            });

            const response = await fetch(`${API_BASE}/search?${queryString}`);
            if (!response.ok) throw new Error('Search failed');
            
            const data = await response.json();
            this.searchResults = data.data;
            
            this.displaySearchResults();
            this.updateSearchStats(data.stats);

        } catch (error) {
            this.displayError('Search failed. Please try again.');
            console.error('Search error:', error);
        } finally {
            this.hideLoading();
        }
    }

    displaySearchResults() {
        const container = document.getElementById('results-container');
        
        if (this.searchResults.length === 0) {
            container.innerHTML = this.createNoResultsMessage();
            return;
        }

        container.innerHTML = this.searchResults.map(event => 
            this.createEventCard(event)
        ).join('');
    }

    createEventCard(event) {
        const progressPercentage = this.calculateProgress(
            event.current_amount, 
            event.goal_amount
        );

        const formattedDate = this.formatDate(event.event_date);
        const formattedPrice = event.is_free ? 
            'FREE' : this.formatCurrency(event.ticket_price);

        return `
            <div class="event-card ${event.is_featured ? 'featured' : ''}">
                <div class="event-image" style="background: linear-gradient(135deg, #${this.stringToColor(event.category_name)} 0%, #${this.stringToColor(event.title)} 100%)">
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
                        <p><i class="fas fa-users"></i> ${event.organization_name}</p>
                    </div>
                    <p class="event-description">${event.short_description}</p>
                    
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>Raised: ${this.formatCurrency(event.current_amount)}</span>
                        <span>Goal: ${this.formatCurrency(event.goal_amount)}</span>
                    </div>
                    
                    <div class="event-actions">
                        <a href="event-details.html?id=${event.id}" class="btn btn-primary">
                            <i class="fas fa-info-circle"></i>
                            View Details
                        </a>
                        <span class="event-spots">
                            ${event.available_tickets ? `${event.available_tickets} spots left` : 'Register Now'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    createNoResultsMessage() {
        const { category, location, date } = this.currentSearchParams;
        
        let message = 'No events found matching your criteria.';
        let suggestions = [];

        if (category && category !== 'all') {
            const categoryName = this.categories.find(cat => cat.id == category)?.name;
            suggestions.push(`Try removing the "${categoryName}" category filter`);
        }

        if (location) {
            suggestions.push(`Try searching in nearby locations instead of "${location}"`);
        }

        if (date) {
            suggestions.push(`Try different dates around ${date}`);
        }

        if (suggestions.length === 0) {
            suggestions.push('Browse all events on our home page');
            suggestions.push('Check back later for new events');
        }

        return `
            <div class="no-results">
                <i class="fas fa-search fa-3x" style="color: #bdc3c7; margin-bottom: 1rem;"></i>
                <h3>No Events Found</h3>
                <p>${message}</p>
                ${suggestions.length > 0 ? `
                    <div style="text-align: left; max-width: 400px; margin: 1.5rem auto;">
                        <h4 style="margin-bottom: 0.5rem;">Suggestions:</h4>
                        <ul style="text-align: left;">
                            ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <div style="margin-top: 1.5rem;">
                    <button class="btn btn-secondary" onclick="searchPage.clearFilters()" style="margin-right: 1rem;">
                        <i class="fas fa-times"></i>
                        Clear Filters
                    </button>
                    <a href="index.html" class="btn btn-primary">
                        <i class="fas fa-home"></i>
                        View All Events
                    </a>
                </div>
            </div>
        `;
    }

    updateSearchStats(stats) {
        const statsElement = document.getElementById('search-stats');
        if (!stats) {
            statsElement.style.display = 'none';
            return;
        }

        document.getElementById('total-events').textContent = stats.total_events || 0;
        document.getElementById('total-raised').textContent = this.formatCurrency(stats.total_raised || 0);
        document.getElementById('avg-progress').textContent = `${(stats.avg_progress || 0).toFixed(1)}%`;
        
        statsElement.style.display = 'block';
    }

    clearFilters() {
        document.getElementById('searchForm').reset();
        document.getElementById('results-container').innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-search fa-4x"></i>
                <h3>Start Your Search</h3>
                <p>Use the filters above to find charity events that match your preferences.</p>
            </div>
        `;
        
        document.getElementById('search-stats').style.display = 'none';
        this.hideError();
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
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('en-AU', options);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
        }).format(amount);
    }

    stringToColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '00000'.substring(0, 6 - color.length) + color;
    }

    showLoading() {
        const loadingElement = document.getElementById('loading-message');
        const resultsContainer = document.getElementById('results-container');
        
        if (loadingElement) loadingElement.style.display = 'block';
        if (resultsContainer) resultsContainer.innerHTML = '';
        
        this.hideError();
    }

    hideLoading() {
        const loadingElement = document.getElementById('loading-message');
        if (loadingElement) loadingElement.style.display = 'none';
    }

    displayError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    hideError() {
        const errorElement = document.getElementById('error-message');
        if (errorElement) errorElement.style.display = 'none';
    }

    handleError(context, error) {
        console.error(`Error: ${context}`, error);
        this.displayError('Something went wrong. Please try again later.');
    }
}

// Initialize search page
const searchPage = new SearchPage();