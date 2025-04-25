import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Define migration types
interface Migration {
    name: string;
    up: (db: sqlite3.Database) => Promise<void>;
}

// Define all migrations
const migrations: Migration[] = [
    {
        name: 'create_migrations_table',
        up: async (db) => {
            await new Promise((resolve, reject) => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS migrations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err) => {
                    if (err) reject(err);
                    else resolve(true);
                });
            });
        }
    },
    {
        name: 'create_cafes_table',
        up: async (db) => {
            await new Promise((resolve, reject) => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS cafes (
                        id INTEGER PRIMARY KEY,
                        name TEXT NOT NULL,
                        image TEXT,
                        images TEXT,
                        address TEXT,
                        latitude REAL,
                        longitude REAL,
                        rating REAL,
                        rating_count INTEGER,
                        price_level INTEGER,
                        website TEXT,
                        phone TEXT,
                        opening_hours TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err) => {
                    if (err) reject(err);
                    else resolve(true);
                });
            });
        }
    },
    {
        name: 'update_cafe_2_image',
        up: async (db) => {
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE cafes SET image = ?, images = ? WHERE id = ?',
                    [
                        'https://cdn.qthotels.com/wp-content/uploads/sites/101/2019/08/16130840/Pascale-into-Bar-scaled.jpg',
                        '["https://cdn.qthotels.com/wp-content/uploads/sites/101/2019/08/16130840/Pascale-into-Bar-scaled.jpg"]',
                        2
                    ],
                    (err) => {
                        if (err) reject(err);
                        else resolve(true);
                    }
                );
            });
        }
    },
    {
        name: 'update_cafe_3_image',
        up: async (db) => {
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE cafes SET image = ?, images = ? WHERE id = ?',
                    [
                        'https://imgix.theurbanlist.com/content/general/cheri_julian_lallo-11.jpg',
                        '["https://imgix.theurbanlist.com/content/general/cheri_julian_lallo-11.jpg"]',
                        3
                    ],
                    (err) => {
                        if (err) reject(err);
                        else resolve(true);
                    }
                );
            });
        }
    },
    {
        name: 'update_cafe_1_image',
        up: async (db) => {
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE cafes SET image = ?, images = ? WHERE id = ?',
                    [
                        'https://whatson.melbourne.vic.gov.au/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6IjlhN2FhNjQ4LTFhMDktNGUzMC1hNWEwLWM4OGUzOTQ1ZWE0NSIsInB1ciI6ImJsb2JfaWQifX0=--4e365d1276a2cc736c048c205885f663ca667bc3/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fbGltaXQiOlsxMDAwLDYwMF19LCJwdXIiOiJ2YXJpYXRpb24ifX0=--0d1dec94e96bf59e4e90ca4a7c11e516560ab297/efab83a6-656b-4985-9fa2-24d94bb9d075.jpg',
                        '["https://whatson.melbourne.vic.gov.au/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6IjlhN2FhNjQ4LTFhMDktNGUzMC1hNWEwLWM4OGUzOTQ1ZWE0NSIsInB1ciI6ImJsb2JfaWQifX0=--4e365d1276a2cc736c048c205885f663ca667bc3/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fbGltaXQiOlsxMDAwLDYwMF19LCJwdXIiOiJ2YXJpYXRpb24ifX0=--0d1dec94e96bf59e4e90ca4a7c11e516560ab297/efab83a6-656b-4985-9fa2-24d94bb9d075.jpg"]',
                        1
                    ],
                    (err) => {
                        if (err) reject(err);
                        else resolve(true);
                    }
                );
            });
        }
    }
];

// Function to run migrations
async function runMigrations(db: sqlite3.Database) {
    try {
        // Get executed migrations
        const executedMigrations = await new Promise<string[]>((resolve, reject) => {
            db.all("SELECT name FROM migrations", (err, rows: { name: string }[]) => {
                if (err) reject(err);
                else resolve(rows.map(row => row.name));
            });
        });

        // Run pending migrations
        for (const migration of migrations) {
            if (!executedMigrations.includes(migration.name)) {
                console.log(`Running migration: ${migration.name}`);
                await migration.up(db);
                
                // Record the migration
                await new Promise((resolve, reject) => {
                    db.run("INSERT INTO migrations (name) VALUES (?)", [migration.name], (err) => {
                        if (err) reject(err);
                        else resolve(true);
                    });
                });
            }
        }
    } catch (error) {
        console.error('Error running migrations:', error);
        throw error;
    }
}

// Initialize database
export async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const dbPath = path.join(process.cwd(), 'assets', 'cafes.db');
        
        // Check if database exists
        if (!fs.existsSync(dbPath)) {
            console.log('Database not found. Creating new database...');
            // Create database file
            fs.writeFileSync(dbPath, '');
        }

        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }

            // Run migrations
            runMigrations(db).then(() => {
                resolve(db);
            }).catch((err) => {
                console.error('Error during migrations:', err);
                reject(err);
            });
        });
    });
} 