// API routes for charity events
const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

/**
 * @route GET /api/events
 * @description Get all active charity events
 * @returns {Object} Events list
 */
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                ce.*, 
                ec.name as category_name,
                co.name as organization_name,
                co.mission_statement as organization_mission
            FROM charity_events ce 
            LEFT JOIN event_categories ec ON ce.category_id = ec.id 
            LEFT JOIN charitable_organizations co ON ce.organization_id = co.id
            WHERE ce.is_active = true 
            ORDER BY 
                ce.is_featured DESC,
                ce.event_date ASC,
                ce.created_at DESC
        `;
        
        const [events] = await promisePool.query(query);
        
        // Categorize events: upcoming and past
        const currentDate = new Date().toISOString().split('T')[0];
        const upcomingEvents = events.filter(event => event.event_date >= currentDate);
        const pastEvents = events.filter(event => event.event_date < currentDate);

        res.json({
            success: true,
            data: {
                all_events: events,
                upcoming_events: upcomingEvents,
                past_events: pastEvents,
                total_upcoming: upcomingEvents.length,
                total_past: pastEvents.length
            },
            message: `Successfully retrieved ${events.length} events`
        });
        
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events',
            message: error.message
        });
    }
});

/**
 * @route GET /api/events/search
 * @description Search events based on criteria
 * @param {string} date - Event date
 * @param {string} location - Event location
 * @param {number} category - Category ID
 * @param {string} query - Search keyword
 * @returns {Object} Matching events list
 */
router.get('/search', async (req, res) => {
    try {
        const { date, location, category, query: searchQuery } = req.query;
        
        let sqlQuery = `
            SELECT 
                ce.*, 
                ec.name as category_name,
                co.name as organization_name
            FROM charity_events ce 
            LEFT JOIN event_categories ec ON ce.category_id = ec.id 
            LEFT JOIN charitable_organizations co ON ce.organization_id = co.id
            WHERE ce.is_active = true
        `;
        
        const params = [];
        const conditions = [];

        // Build dynamic query conditions
        if (date) {
            conditions.push('ce.event_date = ?');
            params.push(date);
        }
        
        if (location) {
            conditions.push('(ce.location LIKE ? OR ce.venue_name LIKE ?)');
            params.push(`%${location}%`, `%${location}%`);
        }
        
        if (category && category !== 'all') {
            conditions.push('ce.category_id = ?');
            params.push(parseInt(category));
        }
        
        if (searchQuery) {
            conditions.push('(ce.title LIKE ? OR ce.short_description LIKE ? OR ce.full_description LIKE ?)');
            params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
        }

        // Add conditions to query
        if (conditions.length > 0) {
            sqlQuery += ' AND ' + conditions.join(' AND ');
        }

        // Sort: upcoming events first
        sqlQuery += ' ORDER BY ce.event_date ASC, ce.is_featured DESC';

        const [events] = await promisePool.query(sqlQuery, params);

        // Calculate search statistics
        const stats = {
            total_events: events.length,
            total_raised: events.reduce((sum, event) => sum + parseFloat(event.current_amount), 0),
            avg_progress: events.length > 0 ? 
                events.reduce((sum, event) => sum + (event.current_amount / event.goal_amount * 100), 0) / events.length : 0
        };

        res.json({
            success: true,
            data: events,
            stats: stats,
            filters: {
                date: date || null,
                location: location || null,
                category: category || null,
                query: searchQuery || null
            },
            message: `Found ${events.length} events matching your criteria`
        });
        
    } catch (error) {
        console.error('Error searching events:', error);
        res.status(500).json({
            success: false,
            error: 'Search failed',
            message: error.message
        });
    }
});

/**
 * @route GET /api/events/categories
 * @description Get all event categories
 * @returns {Object} Categories list
 */
router.get('/categories', async (req, res) => {
    try {
        const query = 'SELECT * FROM event_categories ORDER BY name';
        const [categories] = await promisePool.query(query);

        res.json({
            success: true,
            data: categories,
            total: categories.length,
            message: 'Successfully retrieved event categories'
        });
        
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories',
            message: error.message
        });
    }
});

/**
 * @route GET /api/events/featured
 * @description Get featured events
 * @returns {Object} Featured events list
 */
router.get('/featured', async (req, res) => {
    try {
        const query = `
            SELECT 
                ce.*, 
                ec.name as category_name,
                co.name as organization_name
            FROM charity_events ce 
            LEFT JOIN event_categories ec ON ce.category_id = ec.id 
            LEFT JOIN charitable_organizations co ON ce.organization_id = co.id
            WHERE ce.is_active = true AND ce.is_featured = true
            ORDER BY ce.event_date ASC
            LIMIT 6
        `;
        
        const [events] = await promisePool.query(query);

        res.json({
            success: true,
            data: events,
            total: events.length,
            message: 'Successfully retrieved featured events'
        });
        
    } catch (error) {
        console.error('Error fetching featured events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured events',
            message: error.message
        });
    }
});

/**
 * @route GET /api/events/:id
 * @description Get specific event details
 * @param {number} id - Event ID
 * @returns {Object} Event details
 */
router.get('/:id', async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        
        if (isNaN(eventId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid event ID',
                message: 'Event ID must be a number'
            });
        }

        const query = `
            SELECT 
                ce.*, 
                ec.name as category_name,
                ec.description as category_description,
                co.name as organization_name,
                co.mission_statement as organization_mission,
                co.description as organization_description,
                co.contact_email as organization_email,
                co.phone as organization_phone,
                co.website as organization_website,
                co.address as organization_address
            FROM charity_events ce 
            LEFT JOIN event_categories ec ON ce.category_id = ec.id 
            LEFT JOIN charitable_organizations co ON ce.organization_id = co.id
            WHERE ce.id = ? AND ce.is_active = true
        `;
        
        const [events] = await promisePool.query(query, [eventId]);

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Event not found',
                message: 'The specified event does not exist or has been removed'
            });
        }

        const event = events[0];
        
        // Calculate progress percentage
        event.progress_percentage = event.goal_amount > 0 
            ? Math.min((event.current_amount / event.goal_amount) * 100, 100) 
            : 0;

        // Format date and time
        event.formatted_date = new Date(event.event_date).toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        res.json({
            success: true,
            data: event,
            message: 'Successfully retrieved event details'
        });
        
    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event details',
            message: error.message
        });
    }
});

/**
 * @route GET /api/events/:id/similar
 * @description Get similar events (same category or location)
 * @param {number} id - Event ID
 * @returns {Object} Similar events list
 */
router.get('/:id/similar', async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        
        const query = `
            SELECT 
                ce.*, 
                ec.name as category_name
            FROM charity_events ce 
            LEFT JOIN event_categories ec ON ce.category_id = ec.id 
            WHERE ce.id != ? 
                AND ce.is_active = true 
                AND (ce.category_id = (SELECT category_id FROM charity_events WHERE id = ?) 
                     OR ce.location = (SELECT location FROM charity_events WHERE id = ?))
            ORDER BY ce.event_date ASC
            LIMIT 4
        `;
        
        const [events] = await promisePool.query(query, [eventId, eventId, eventId]);

        res.json({
            success: true,
            data: events,
            total: events.length,
            message: 'Successfully retrieved similar events'
        });
        
    } catch (error) {
        console.error('Error fetching similar events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch similar events',
            message: error.message
        });
    }
});

module.exports = router;