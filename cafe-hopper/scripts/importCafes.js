const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Create SQLite database
const db = new sqlite3.Database('cafes.db');

// Create cafes table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS cafes (
        id INTEGER PRIMARY KEY,
        name TEXT,
        address TEXT,
        area TEXT,
        industry TEXT,
        indoor_seating INTEGER,
        outdoor_seating INTEGER,
        latitude REAL,
        longitude REAL,
        tags TEXT,
        image TEXT,
        hours TEXT,
        public_users INTEGER,
        images TEXT
    )`);

    // Read CSV file
    const results = [];
    let rowCount = 0;
    let skippedCount = 0;
    let cafeId = 1; // Start with ID 1

    fs.createReadStream('cc7750fc-3c57-43c3-a5f5-c2af85db4c74.csv')
        .pipe(csv())
        .on('data', (data) => {
            rowCount++;
            if (rowCount % 1000 === 0) {
                console.log(`Processed ${rowCount} rows (${results.length} valid entries, ${skippedCount} skipped)...`);
            }

            // Only process if it's a cafe/restaurant from 2010 onwards
            const censusYear = parseInt(data.census_year);
            if (data.industry_anzsic4_description === 'Cafes and Restaurants' && censusYear >= 2010) {
                const cafe = {
                    id: cafeId++, // Assign sequential ID
                    name: data.trading_name || '',
                    address: data.building_address || '',
                    area: data.clue_small_area || '',
                    industry: data.industry_anzsic4_description,
                    indoor_seating: data.indoor_seating ? parseInt(data.indoor_seating) : null,
                    outdoor_seating: data.outdoor_seating ? parseInt(data.outdoor_seating) : null,
                    latitude: parseFloat(data.latitude) || 0,
                    longitude: parseFloat(data.longitude) || 0,
                    tags: data.tags ? JSON.stringify(data.tags.split(',')) : '[]',
                    image: data.image || 'https://source.unsplash.com/800x600/?cafe',
                    hours: data.hours || '9am - 5pm',
                    public_users: 0,
                    images: JSON.stringify([data.image || 'https://source.unsplash.com/800x600/?cafe'])
                };
                results.push(cafe);
            } else {
                skippedCount++;
            }
        })
        .on('end', () => {
            console.log(`\nFinished reading CSV.`);
            console.log(`Total rows processed: ${rowCount}`);
            console.log(`Valid entries (Cafes and Restaurants from 2010+): ${results.length}`);
            console.log(`Skipped entries: ${skippedCount}`);
            console.log(`Assigned IDs from 1 to ${cafeId - 1}`);
            
            if (results.length === 0) {
                console.error('No valid venues found in CSV file');
                process.exit(1);
            }

            // Insert data into SQLite
            const stmt = db.prepare(`INSERT OR REPLACE INTO cafes (
                id, name, address, area, industry, indoor_seating, outdoor_seating,
                latitude, longitude, tags, image, hours, public_users, images
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

            results.forEach(cafe => {
                stmt.run(
                    cafe.id,
                    cafe.name,
                    cafe.address,
                    cafe.area,
                    cafe.industry,
                    cafe.indoor_seating,
                    cafe.outdoor_seating,
                    cafe.latitude,
                    cafe.longitude,
                    cafe.tags,
                    cafe.image,
                    cafe.hours,
                    cafe.public_users,
                    cafe.images
                );
            });

            stmt.finalize();
            console.log('Data import completed successfully');
            db.close();
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
            process.exit(1);
        });
}); 