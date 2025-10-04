// Data models for charity events
const { promisePool } = require('../config/database');

class EventModel {
    /**
     * Find all active events
     */
    static async findAllActive() {
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
        return events;
    }

    /**
     * Find event by ID
     */
    static async findById(id) {
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
        
        const [events] = await promisePool.query(query, [id]);
        return events.length > 0 ? events[0] : null;
    }

    /**
     * Search events with filters
     */
    static async search(filters = {}) {
        let query = `
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
        if (filters.date) {
            conditions.push('ce.event_date = ?');
            params.push(filters.date);
        }
        
        if (filters.location) {
            conditions.push('(ce.location LIKE ? OR ce.venue_name LIKE ?)');
            params.push(`%${filters.location}%`, `%${filters.location}%`);
        }
        
        if (filters.category && filters.category !== 'all') {
            conditions.push('ce.category_id = ?');
            params.push(parseInt(filters.category));
        }
        
        if (filters.query) {
            conditions.push('(ce.title LIKE ? OR ce.short_description LIKE ? OR ce.full_description LIKE ?)');
            params.push(`%${filters.query}%`, `%${filters.query}%`, `%${filters.query}%`);
        }

        // Add conditions to query
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        // Sort: upcoming events first
        query += ' ORDER BY ce.event_date ASC, ce.is_featured DESC';

        const [events] = await promisePool.query(query, params);
        return events;
    }

    /**
     * Find all categories
     */
    static async findAllCategories() {
        const query = 'SELECT * FROM event_categories ORDER BY name';
        const [categories] = await promisePool.query(query);
        return categories;
    }

    /**
     * Find featured events
     */
    static async findFeaturedEvents(limit = 6) {
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
            LIMIT ?
        `;
        
        const [events] = await promisePool.query(query, [limit]);
        return events;
    }

    /**
     * Find similar events
     */
    static async findSimilarEvents(eventId, limit = 4) {
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
            LIMIT ?
        `;
        
        const [events] = await promisePool.query(query, [eventId, eventId, eventId, limit]);
        return events;
    }

    /**
     * Check if event exists
     */
    static async exists(id) {
        const query = 'SELECT 1 FROM charity_events WHERE id = ? AND is_active = true';
        const [rows] = await promisePool.query(query, [id]);
        return rows.length > 0;
    }

    /**
     * Find upcoming events
     */
    static async findUpcomingEvents(limit = null) {
        let query = `
            SELECT 
                ce.*, 
                ec.name as category_name,
                co.name as organization_name
            FROM charity_events ce 
            LEFT JOIN event_categories ec ON ce.category_id = ec.id 
            LEFT JOIN charitable_organizations co ON ce.organization_id = co.id
            WHERE ce.is_active = true AND ce.event_date >= CURDATE()
            ORDER BY ce.event_date ASC
        `;
        
        if (limit) {
            query += ' LIMIT ?';
            const [events] = await promisePool.query(query, [limit]);
            return events;
        } else {
            const [events] = await promisePool.query(query);
            return events;
        }
    }

    /**
     * Find past events
     */
    static async findPastEvents() {
        const query = `
            SELECT 
                ce.*, 
                ec.name as category_name,
                co.name as organization_name
            FROM charity_events ce 
            LEFT JOIN event_categories ec ON ce.category_id = ec.id 
            LEFT JOIN charitable_organizations co ON ce.organization_id = co.id
            WHERE ce.is_active = true AND ce.event_date < CURDATE()
            ORDER BY ce.event_date DESC
        `;
        
        const [events] = await promisePool.query(query);
        return events;
    }
}

module.exports = EventModel;