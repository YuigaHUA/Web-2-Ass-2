# Charity Events Management System
A dynamic web application for managing and browsing charity events, built with Node.js, Express, MySQL, and vanilla JavaScript.

# Project Overview
This project is a full-stack web application that allows users to:
- Browse upcoming charity events
- Search and filter events by date, location, and category
- View detailed event information
- Track fundraising progress
- (Future) Register for events and purchase tickets

# Project Structure
charity-events-platform/
├── backend/ # Node.js/Express backend
│ ├── config/ # Database configuration
│ ├── models/ # Data models
│ ├── routes/ # API routes
│ ├── app.js # Main application file
│ ├── package.json # Backend dependencies
│ └── .env # Environment variables
├── frontend/ # Client-side application
│ ├── css/ # Stylesheets
│ ├── js/ # JavaScript modules
│ ├── assets/ # Images and static files
│ ├── index.html # Home page
│ ├── search.html # Search page
│ └── event-details.html # Event details page
├── database/ # Database schema and sample data
└── README.md # Project documentation
Quick Start

# Prerequisites
Node.js (v14 or higher)
MySQL (v5.7 or higher)
git clone https://github.com/YuigaHUA/Web-2-Ass-2.git

cd charity-events-platform
# Login to MySQL and create the database
mysql -u root -p

# In MySQL console:
CREATE DATABASE charityevents_db;
EXIT;

# Import the schema and sample data
mysql -u root -p charityevents_db < database/charityevents_db.sql

Create Environment Configuration File
Create a .env file in the backend folder with the following content:

env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=charityevents_db
PORT=3000
DEBUG=true
Important: Replace your_mysql_password_here with your actual MySQL password.

# Quick creation methods:
# Windows Command Prompt:

cmd
cd backend
echo DB_HOST=localhost > .env
echo DB_USER=root >> .env
echo DB_PASSWORD=your_mysql_password_here >> .env
echo DB_NAME=charityevents_db >> .env
echo PORT=3000 >> .env
echo DEBUG=true >> .env

# Linux/Mac Terminal:

cd backend
cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=charityevents_db
PORT=3000
DEBUG=true
EOF

# Install backend dependencies
cmd
cd backend
npm install

# Start the backend server
npm start
npm run dev

Access the application
Open your browser and navigate to http://localhost:3000
The API will be available at http://localhost:3000/api/events

# Database Schema
Main Tables
charitable_organizations - Charity organization details
event_categories - Event categories (Gala, Fun Run, etc.)
charity_events - Main events table with all event details

Sample Data Included
2 charitable organizations
8 event categories
8 sample events with realistic data

# API Endpoints
Events
GET /api/events - Get all active events
GET /api/events/search - Search events with filters
GET /api/events/featured - Get featured events
GET /api/events/:id - Get specific event details
GET /api/events/:id/similar - Get similar events

# Categories
GET /api/events/categories - Get all event categories

# Frontend Features
Home Page (/)
Organization information and mission statement
Featured events display
All upcoming events grid
Category browsing
Responsive navigation

# Search Page (/search)
Advanced filtering by date, location, and category
Real-time search results
Search statistics and summaries
Quick category filters

# Event Details Page (/event-details.html?id=:id)
Comprehensive event information
Fundraising progress tracking
Organization details
Similar events recommendations
Registration modal
Technology Stack

# Backend
Node.js - Runtime environment
Express.js - Web framework
MySQL2 - Database driver
CORS - Cross-origin resource sharing
dotenv - Environment configuration

# Frontend
Vanilla JavaScript - No frameworks for simplicity
CSS3 - Modern styling with Flexbox/Grid
HTML5 - Semantic markup
Font Awesome - Icons

# Database
MySQL - Relational database
Foreign keys - Data integrity
Key Features Implemented

# Database Design and Setup
RESTful API Development
Dynamic Activity List
Advanced Search Functionality
Activity Details Page
Responsive Design
Error Handling
Loading States
Progress Tracking
Category Filtering

# Database and API (Modules 2-3)
 MySQL database with correct schema
 RESTful API endpoints
 Proper error handling
 Data validation

# Client Website (Modules 1-4)
 Homepage with dynamic content
 Search page with filtering capabilities
 Activity details page
 Navigation system
 API integration
 DOM manipulation

# Technical Requirements
 Node.js, HTML, JavaScript, DOM, MySQL
 Dynamic content loading
 Professional design
 Responsive layout

# Troubleshooting

# Common Issues

1. **Database Connection Failure**
   - Verify MySQL service is running
   - Check database credentials in `.env` file
   - Ensure database has been created

2. **Port Already in Use**
   - Change PORT in `.env`
   - Terminate existing process: `npx kill-port 3000`

3. **CORS Errors**
   - Check CORS configuration in `app.js`
   - Confirm frontend is being served from correct origin

4. **API Endpoints Not Working**
   - Check if server is running
   - Verify endpoint URLs in frontend JavaScript
   - Check browser console for errors

# Debug Mode

Enable debug logging by setting `DEBUG=true` in environment variables.

# Development Notes

# Code Organization
- Backend follows MVC pattern
- Frontend uses modular JavaScript classes
- CSS uses variables for theming
- SQL files include sample data

# Performance Considerations
- Database connection pooling
- Efficient SQL queries with indexes
- Appropriate client-side caching
- Optimized images and assets

# Security Considerations
- Input validation for API endpoints
- Parameterized queries to prevent SQL injection
- CORS configuration
- Environment variables protection
