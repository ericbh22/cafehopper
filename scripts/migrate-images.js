const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to the database file
const dbPath = path.join(__dirname, '../assets/cafes.db');

// Check if database exists
if (!fs.existsSync(dbPath)) {
    console.error('Error: Database file not found at', dbPath);
    process.exit(1);
}

// Open the database
const db = new sqlite3.Database(dbPath);

// Update Hikari Life images
db.run(
    'UPDATE cafes SET image = ?, images = ? WHERE id = ?',
    [
        'https://kurasu.kyoto/cdn/shop/articles/DSC08705-1036c2f8-43c9-4596-a0c1-dca7dc27a419-2_1600x.jpg?v=1646708315',
        '["https://kurasu.kyoto/cdn/shop/articles/DSC08705-1036c2f8-43c9-4596-a0c1-dca7dc27a419-2_1600x.jpg?v=1646708315"]',
        20145
    ],
    function(err) {
        if (err) {
            console.error('Error updating Hikari Life images:', err);
        } else {
            console.log('Successfully updated Hikari Life images');
            console.log('Rows affected:', this.changes);
        }
        db.close();
    }
); 