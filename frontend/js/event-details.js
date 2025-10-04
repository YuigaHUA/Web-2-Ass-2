// Event details page functionality for Charity Events Platform
const API_BASE = 'http://localhost:3000/api/events';

class EventDetailsPage {
    constructor() {
        this.eventId = null;
        this.eventData = null;
        this.similarEvents = [];
        
        this.init();
    }

    async init() {
        try {
            this.eventId = this.getEventIdFromUrl();
            
            if (!this.eventId) {
                this.showError('Invalid event ID. Please select an event from the home or search page.');
                return;
            }

            await this.loadEventDetails();
            this.setupEventListeners();
            this.setupModal();
            
        } catch (error) {
            this.handleError('Event details page initialization failed', error);
        }
    }

    getEventIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('id');
        
        if (!eventId) {
            return null;
        }

        const parsedId = parseInt(eventId);
        return isNaN(parsedId) ? null : parsedId;
    }

    async loadEventDetails() {
        try {
            this.showLoading();
            
            // Load event details and similar events
            const [eventData, similarData] = await Promise.all([
                this.apiRequest(`/${this.eventId}`),
                this.apiRequest(`/${this.eventId}/similar`)
            ]);

            this.eventData = eventData.data;
            this.similarEvents = similarData.data;

            this.displayEventDetails();
            this.displaySimilarEvents();
            this.updatePageMetadata();
            
            console.log('Event details loaded', {
                event: this.eventData.title,
                similarEvents: this.similarEvents.length
            });

        } catch (error) {
            if (error.message.includes('404')) {
                this.showError('Event not found. It may have been removed or you may have followed an invalid link.');
            } else {
                this.showError('Failed to load event details. Please try again later.');
            }
            throw error;
        } finally {
            this.hideLoading();
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

    displayEventDetails() {
        this.displayEventHeader();
        this.displayEventDescription();
        this.displayFundraisingProgress();
        this.displayEventDetails();
        this.displayEventHighlights();
        this.displayTicketInfo();
        this.displayOrganizationInfo();
        
        // Show main content
        document.getElementById('event-content').style.display = 'block';
    }

    displayEventHeader() {
        const event = this.eventData;
        
        // Set page title
        document.title = `${event.title} - Hope Foundation`;

        // Update event title
        document.getElementById('event-title').textContent = event.title;

        // Update event metadata
        const metaContainer = document.getElementById('event-meta');
        metaContainer.innerHTML = `
            <p><i class="fas fa-calendar"></i> ${event.formatted_date} at ${event.event_time}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${event.venue_name}, ${event.location}</p>
            <p><i class="fas fa-tags"></i> ${event.category_name}</p>
        `;

        // Update organization info
        const orgContainer = document.getElementById('event-org');
        orgContainer.innerHTML = `
            <p>Organized by <strong>${event.organization_name}</strong></p>
        `;

        // Add featured badge
        if (event.is_featured) {
            document.getElementById('event-badge').innerHTML = `
                <span class="featured-badge">
                    <i class="fas fa-star"></i>
                    Featured Event
                </span>
            `;
        }
    }

    displayEventDescription() {
        const container = document.getElementById('event-full-description');
        const description = this.eventData.full_description || this.eventData.short_description;
        
        container.innerHTML = `
            <p>${description}</p>
            <div class="event-purpose">
                <h4><i class="fas fa-bullseye"></i> Event Purpose</h4>
                <p>Join us in supporting this important cause. Your participation and contribution will help create meaningful change in our community. Every ticket purchased or donation made directly supports our mission and helps us achieve our fundraising goals.</p>
            </div>
        `;
    }

    displayFundraisingProgress() {
        const event = this.eventData;
        const progressPercentage = event.progress_percentage || 0;
        
        // Update amounts
        document.getElementById('current-amount').textContent = this.formatCurrency(event.current_amount);
        document.getElementById('goal-amount').textContent = this.formatCurrency(event.goal_amount);
        document.getElementById('progress-percentage').textContent = `${progressPercentage.toFixed(1)}%`;
        
        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = `${progressPercentage}%`;
        
        // Update supporters count (simulated data)
        const donorsCount = Math.max(10, Math.floor(event.current_amount / 100));
        document.getElementById('donors-count').textContent = donorsCount.toLocaleString();
    }

    displayEventDetails() {
        const event = this.eventData;
        
        document.getElementById('event-datetime').textContent = 
            `${event.formatted_date} at ${event.event_time}`;
        
        document.getElementById('event-venue').textContent = 
            `${event.venue_name}, ${event.location}${event.address ? ` - ${event.address}` : ''}`;
        
        document.getElementById('event-category').textContent = event.category_name;
        document.getElementById('event-organization').textContent = event.organization_name;
    }

    displayEventHighlights() {
        const container = document.getElementById('event-highlights');
        const category = this.eventData.category_name.toLowerCase();
        
        const highlights = this.getHighlightsByCategory(category);
        
        container.innerHTML = highlights.map(highlight => `
            <div class="highlight-item">
                <i class="fas ${highlight.icon}"></i>
                <span>${highlight.text}</span>
            </div>
        `).join('');
    }

    getHighlightsByCategory(category) {
        const highlightsMap = {
            'gala dinner': [
                { icon: 'fa-utensils', text: 'Gourmet dining experience' },
                { icon: 'fa-music', text: 'Live entertainment' },
                { icon: 'fa-gavel', text: 'Silent and live auctions' },
                { icon: 'fa-users', text: 'Networking opportunities' }
            ],
            'fun run/walk': [
                { icon: 'fa-medal', text: 'Finisher medal for all participants' },
                { icon: 'fa-tshirt', text: 'Event t-shirt included' },
                { icon: 'fa-heart', text: 'Support health and wellness' },
                { icon: 'fa-camera', text: 'Professional photography' }
            ],
            'silent auction': [
                { icon: 'fa-gem', text: 'Unique items and experiences' },
                { icon: 'fa-glass-cheers', text: 'Complimentary drinks and canapés' },
                { icon: 'fa-paint-brush', text: 'Featured local artists' },
                { icon: 'fa-hands-helping', text: '100% proceeds to charity' }
            ],
            'charity concert': [
                { icon: 'fa-music', text: 'World-class performances' },
                { icon: 'fa-star', text: 'Acclaimed musicians' },
                { icon: 'fa-graduation-cap', text: 'Support music education' },
                { icon: 'fa-users', text: 'Meet the artists' }
            ]
        };

        return highlightsMap[category] || [
            { icon: 'fa-hands-helping', text: 'Make a meaningful impact' },
            { icon: 'fa-users', text: 'Connect with like-minded people' },
            { icon: 'fa-heart', text: 'Support important causes' },
            { icon: 'fa-star', text: 'Memorable experience' }
        ];
    }

    displayTicketInfo() {
        const event = this.eventData;
        
        const priceContainer = document.getElementById('ticket-price');
        const descriptionContainer = document.getElementById('ticket-description');
        const deadlineContainer = document.getElementById('deadline-date');
        
        // Ticket price information
        if (event.is_free) {
            priceContainer.textContent = 'FREE';
            priceContainer.style.color = '#27ae60';
            descriptionContainer.textContent = 'Free admission - donations appreciated to support our cause!';
        } else {
            priceContainer.textContent = this.formatCurrency(event.ticket_price);
            descriptionContainer.textContent = `Ticket price includes donation to support ${event.organization_name}'s mission`;
        }
        
        // Registration deadline
        const deadline = event.registration_deadline ? 
            this.formatDate(event.registration_deadline) : 
            this.formatDate(event.event_date);
            
        deadlineContainer.textContent = deadline;
        
        // Available tickets warning
        if (event.available_tickets && event.available_tickets < 50) {
            const lowTicketsWarning = document.createElement('div');
            lowTicketsWarning.className = 'low-tickets-warning';
            lowTicketsWarning.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                Only ${event.available_tickets} spots left!
            `;
            document.querySelector('.ticket-info').appendChild(lowTicketsWarning);
        }
    }

    displayOrganizationInfo() {
        const event = this.eventData;
        const container = document.getElementById('org-info-content');
        
        container.innerHTML = `
            <h4>${event.organization_name}</h4>
            <p>${event.organization_description || event.organization_mission || 'Dedicated to creating positive change in our community.'}</p>
            <div class="org-details">
                <p><i class="fas fa-envelope"></i> ${event.organization_email}</p>
                <p><i class="fas fa-phone"></i> ${event.organization_phone}</p>
                ${event.organization_website ? `<p><i class="fas fa-globe"></i> ${event.organization_website}</p>` : ''}
            </div>
        `;
    }

    displaySimilarEvents() {
        const container = document.getElementById('similar-events-container');
        
        if (this.similarEvents.length === 0) {
            container.innerHTML = `
                <div class="no-similar-events">
                    <p>No similar events found at the moment.</p>
                    <a href="search.html" class="btn btn-primary">Browse All Events</a>
                </div>
            `;
            return;
        }

        container.innerHTML = this.similarEvents.map(event => {
            const progressPercentage = this.calculateProgress(
                event.current_amount, 
                event.goal_amount
            );

            return `
                <div class="event-card compact">
                    <div class="event-image compact">
                        <div class="event-image-content">
                            <div class="event-category">${event.category_name}</div>
                        </div>
                    </div>
                    <div class="event-content">
                        <h4 class="event-title">${event.title}</h4>
                        <div class="event-meta">
                            <p><i class="fas fa-calendar"></i> ${this.formatDate(event.event_date)}</p>
                            <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                        </div>
                        <a href="event-details.html?id=${event.id}" class="btn btn-outline">
                            View Details
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    updatePageMetadata() {
        // Update page meta tags for SEO and social media sharing
        const event = this.eventData;
        
        // Update Open Graph tags
        this.updateMetaTag('og:title', event.title);
        this.updateMetaTag('og:description', event.short_description);
        this.updateMetaTag('og:url', window.location.href);
    }

    updateMetaTag(property, content) {
        let metaTag = document.querySelector(`meta[property="${property}"]`) || 
                     document.querySelector(`meta[name="${property}"]`);
        
        if (!metaTag) {
            metaTag = document.createElement('meta');
            if (property.startsWith('og:')) {
                metaTag.setAttribute('property', property);
            } else {
                metaTag.setAttribute('name', property);
            }
            document.head.appendChild(metaTag);
        }
        
        metaTag.setAttribute('content', content);
    }

    setupEventListeners() {
        // Register button
        document.getElementById('registerBtn').addEventListener('click', () => {
            this.showRegistrationModal();
        });

        // Share buttons
        this.setupShareButtons();
    }

    setupShareButtons() {
        const shareButtons = document.querySelectorAll('.share-btn');
        
        shareButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.classList[1]; // facebook, twitter, etc.
                this.shareEvent(platform);
            });
        });
    }

    shareEvent(platform) {
        const event = this.eventData;
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(`Check out "${event.title}" - ${event.short_description}`);
        
        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            email: `mailto:?subject=${encodeURIComponent(event.title)}&body=${text}%0A%0A${url}`
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    }

    setupModal() {
        const modal = document.getElementById('registerModal');
        const closeBtn = document.querySelector('.close');
        const closeModalBtn = document.getElementById('closeModal');

        closeBtn.addEventListener('click', () => this.hideRegistrationModal());
        closeModalBtn.addEventListener('click', () => this.hideRegistrationModal());

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                this.hideRegistrationModal();
            }
        });
    }

    showRegistrationModal() {
        const modal = document.getElementById('registerModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    hideRegistrationModal() {
        const modal = document.getElementById('registerModal');
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Utility functions
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

    calculateProgress(current, goal) {
        if (!goal || goal === 0) return 0;
        return Math.min((current / goal) * 100, 100);
    }

    showLoading() {
        document.getElementById('loading-message').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading-message').style.display = 'none';
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        const loadingElement = document.getElementById('loading-message');
        const contentElement = document.getElementById('event-content');
        
        loadingElement.style.display = 'none';
        contentElement.style.display = 'none';
        
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Oops! Something went wrong</h3>
            <p>${message}</p>
            <div style="margin-top: 1rem;">
                <a href="index.html" class="btn btn-primary" style="margin-right: 1rem;">
                    <i class="fas fa-home"></i>
                    Go Home
                </a>
                <a href="search.html" class="btn btn-secondary">
                    <i class="fas fa-search"></i>
                    Browse Events
                </a>
            </div>
        `;
        errorElement.style.display = 'block';
    }

    handleError(context, error) {
        console.error(`Error: ${context}`, error);
    }
}

// Add compact card styles
const compactStyles = document.createElement('style');
compactStyles.textContent = `
    .events-grid.compact {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
    }
    
    .event-card.compact .event-image.compact {
        height: 120px;
    }
    
    .event-card.compact .event-content {
        padding: 1rem;
    }
    
    .event-card.compact .event-title {
        font-size: 1rem;
        margin-bottom: 0.5rem;
    }
    
    .featured-badge {
        background: #27ae60;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .low-tickets-warning {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        color: #856404;
        padding: 0.75rem;
        border-radius: 8px;
        margin-top: 1rem;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .progress-card {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 12px;
        margin: 1rem 0;
    }
    
    .progress-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .progress-stat {
        text-align: center;
    }
    
    .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: bold;
        color: #2c3e50;
    }
    
    .stat-label {
        font-size: 0.8rem;
        color: #7f8c8d;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .progress-container.large {
        height: 12px;
        margin: 1rem 0;
    }
    
    .progress-donors {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-top: 1rem;
    }
    
    .details-grid {
        display: grid;
        gap: 1rem;
    }
    
    .detail-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .detail-item i {
        color: #e74c3c;
        margin-top: 0.25rem;
    }
    
    .highlights-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }
    
    .highlight-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .highlight-item i {
        color: #27ae60;
        font-size: 1.2rem;
    }
    
    .share-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
    }
    
    .share-btn {
        padding: 0.75rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.2rem;
        transition: all 0.3s ease;
    }
    
    .share-btn.facebook { background: #3b5998; color: white; }
    .share-btn.twitter { background: #1da1f2; color: white; }
    .share-btn.linkedin { background: #0077b5; color: white; }
    .share-btn.email { background: #7f8c8d; color: white; }
    
    .share-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .no-similar-events {
        text-align: center;
        padding: 2rem;
        grid-column: 1 / -1;
    }
    
    .ticket-features {
        margin: 1rem 0;
    }
    
    .feature {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        color: #27ae60;
    }
    
    .registration-deadline {
        margin-top: 1rem;
        padding: 0.75rem;
        background: #fff3cd;
        border-radius: 8px;
        font-size: 0.9rem;
        color: #856404;
        text-align: center;
    }
`;
document.head.appendChild(compactStyles);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    new EventDetailsPage();
});