DROP DATABASE IF EXISTS charityevents_db;
CREATE DATABASE charityevents_db;
USE charityevents_db;

CREATE TABLE event_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE charitable_organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    mission_statement TEXT,
    description TEXT,
    contact_email VARCHAR(200),
    phone VARCHAR(20),
    website VARCHAR(300),
    address TEXT,
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE charity_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    short_description TEXT,
    full_description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    venue_name VARCHAR(100),
    address TEXT,
    category_id INT,
    organization_id INT,
    ticket_price DECIMAL(10,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    goal_amount DECIMAL(12,2),
    current_amount DECIMAL(12,2) DEFAULT 0,
    available_tickets INT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    registration_deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES event_categories(id),
    FOREIGN KEY (organization_id) REFERENCES charitable_organizations(id)
);

INSERT INTO charitable_organizations (name, mission_statement, description, contact_email, phone, website, address, logo_url) VALUES
('Hope Foundation Australia', 'To create positive change through community-driven charity events and fundraising initiatives', 'Since 2010, Hope Foundation has been dedicated to supporting various causes including children education, healthcare, and environmental conservation. We believe in the power of community and the difference we can make together.', 'contact@hopefoundation.org', '+61 2 9876 5432', 'https://hopefoundation.org', 'Level 5, 123 George St, Sydney NSW 2000', '/assets/images/logo-hope.png'),
('Run for Life Charity', 'Promoting health and wellness while raising funds for medical research', 'Run for Life organizes fun runs and marathons across Australia to support medical research and healthcare initiatives. Join thousands of Australians in making a difference through fitness and community engagement.', 'info@runforlife.org', '+61 3 8765 4321', 'https://runforlife.org', '456 Collins St, Melbourne VIC 3000', '/assets/images/logo-run.png');

INSERT INTO event_categories (name, description) VALUES
('Gala Dinner', 'Formal fundraising dinners with entertainment and auctions'),
('Fun Run/Walk', 'Charity running and walking events for all fitness levels'),
('Silent Auction', 'Bid-based fundraising events with valuable items and experiences'),
('Charity Concert', 'Musical performances and entertainment events'),
('Community Workshop', 'Educational and skill-building charity events'),
('Food Festival', 'Culinary events supporting local communities'),
('Art Exhibition', 'Art shows and exhibitions for charitable causes'),
('Sports Tournament', 'Competitive sports events for fundraising');

INSERT INTO charity_events (title, short_description, full_description, event_date, event_time, location, venue_name, address, category_id, organization_id, ticket_price, is_free, goal_amount, current_amount, available_tickets, image_url, is_featured, registration_deadline) VALUES
('Hope Foundation Annual Gala 2024', 'An elegant evening of fine dining and entertainment supporting children education', 'Join us for our most anticipated event of the year! The Hope Foundation Annual Gala brings together philanthropists, community leaders, and supporters for an unforgettable evening. Enjoy a gourmet dinner, live entertainment from acclaimed performers, silent and live auctions featuring exclusive experiences, and inspiring stories from the children whose lives you are helping to transform. Black tie attire. All proceeds support our education programs for underprivileged children across Australia.', '2024-12-15', '19:00:00', 'Sydney', 'Grand Convention Center', '1 Convention Centre Ave, Sydney NSW 2000', 1, 1, 250.00, false, 150000.00, 87500.00, 120, '/assets/images/gala-2024.jpg', true, '2024-12-10'),

('City to Surf Fun Run 2024', '5K and 10K runs supporting cancer research with scenic routes', 'Lace up your running shoes for the annual City to Surf Fun Run! Choose between our 5K family-friendly route or the challenging 10K course, both offering stunning views of our coastline. This event is perfect for runners of all levels - from competitive athletes to first-time participants. Your registration includes an event t-shirt, finisher medal, and post-race refreshments. Join thousands of participants in making strides against cancer while enjoying a beautiful day of community and fitness.', '2024-11-20', '08:00:00', 'Melbourne', 'Albert Park', 'Albert Park Drive, Melbourne VIC 3004', 2, 2, 35.00, false, 75000.00, 42300.00, 2000, '/assets/images/funrun-2024.jpg', true, '2024-11-15'),

('Art for Hope Silent Auction', 'Bid on amazing artworks from talented local artists supporting mental health', 'Discover incredible talent while supporting mental health awareness at our Art for Hope Silent Auction. Featuring works from over 50 emerging and established Australian artists, this event offers the perfect opportunity to acquire unique pieces while contributing to an important cause. Enjoy complimentary drinks and canapés as you browse the collection. From contemporary paintings and sculptures to photography and digital art, there is something for every collector. 100% of proceeds support mental health programs in our community.', '2024-10-30', '18:30:00', 'Brisbane', 'Modern Art Gallery Brisbane', '300 South Bank, Brisbane QLD 4101', 3, 1, 0.00, true, 50000.00, 28700.00, 150, '/assets/images/art-auction.jpg', false, '2024-10-25'),

('Symphony of Hope Charity Concert', 'An evening of classical music supporting youth music education', 'Experience the magic of classical music while supporting the next generation of musicians. The Sydney Symphony Orchestra presents a special charity concert featuring works by Mozart, Beethoven, and contemporary Australian composers. This exclusive performance includes a pre-concert reception with the musicians and a post-concert meet-and-greet. Your attendance helps fund music education programs in schools and provides instruments for talented students from disadvantaged backgrounds.', '2024-11-05', '19:30:00', 'Sydney', 'Sydney Opera House', 'Bennelong Point, Sydney NSW 2000', 4, 1, 120.00, false, 80000.00, 45200.00, 300, '/assets/images/concert-hope.jpg', true, '2024-10-30'),

('Sustainable Living Workshop Series', 'Learn eco-friendly skills while supporting environmental conservation', 'Join our 4-part workshop series focused on sustainable living practices. Each session covers practical skills you can implement at home: Urban Gardening (Session 1), Zero-Waste Cooking (Session 2), Renewable Energy Basics (Session 3), and Eco-Friendly Home Solutions (Session 4). Led by experts in sustainability, these hands-on workshops include all materials and a sustainable living starter kit. Perfect for families and individuals looking to reduce their environmental footprint while supporting conservation efforts.', '2024-10-15', '10:00:00', 'Perth', 'Eco Community Center', '78 Green Street, Perth WA 6000', 5, 1, 45.00, false, 20000.00, 12300.00, 80, '/assets/images/workshop-sustainable.jpg', false, '2024-10-10'),

('Taste of Melbourne Food Festival', 'Culinary extravaganza supporting local food banks and community kitchens', 'Indulge in Melbourne finest culinary offerings while fighting food insecurity. The Taste of Melbourne Food Festival brings together top chefs, restaurants, and food producers for a weekend of delicious experiences. Enjoy cooking demonstrations, wine tastings, gourmet food stalls, and chef-led workshops. A portion of every ticket sold provides 10 meals to families in need through our partner food banks. Come hungry and leave fulfilled, knowing you are making a difference in your community.', '2024-12-05', '11:00:00', 'Melbourne', 'Royal Exhibition Building', '9 Nicholson St, Carlton VIC 3053', 6, 2, 65.00, false, 60000.00, 34200.00, 500, '/assets/images/food-festival.jpg', false, '2024-11-30'),

('Charity Golf Tournament 2024', 'Annual golf event supporting children healthcare initiatives', 'Tee off for a great cause at our annual Charity Golf Tournament! Enjoy a day of golf at one of Australia premier courses, complete with breakfast, lunch, and awards dinner. The event includes individual and team competitions, longest drive and closest-to-pin contests, and fantastic prizes. Corporate sponsorship opportunities and foursome packages available. All proceeds support children healthcare programs, providing medical equipment and treatment for sick children across Australia.', '2024-11-25', '07:30:00', 'Adelaide', 'Royal Adelaide Golf Club', '328 Tapleys Hill Rd, Seaton SA 5023', 8, 2, 200.00, false, 100000.00, 56700.00, 144, '/assets/images/golf-tournament.jpg', false, '2024-11-20'),

('Winter Wonderland Gala', 'Magical winter-themed gala supporting homeless shelters', 'Step into a magical winter wonderland at our enchanting gala event. The venue will be transformed with sparkling decorations, ice sculptures, and festive lighting. Enjoy a gourmet seasonal menu, live musical performances, dancing, and a special visit from Santa! The evening includes a luxury raffle and silent auction with incredible prizes. Your support provides warm meals, shelter, and essential services for individuals and families experiencing homelessness during the winter months.', '2024-12-20', '18:00:00', 'Sydney', 'The Westin Sydney', '1 Martin Pl, Sydney NSW 2000', 1, 1, 180.00, false, 120000.00, 67800.00, 200, '/assets/images/winter-gala.jpg', true, '2024-12-15');