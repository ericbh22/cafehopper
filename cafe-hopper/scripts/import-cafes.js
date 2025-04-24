const fs = require('fs');
const csv = require('csv-parser');
const admin = require('firebase-admin');
const path = require('path');

// Check if service account file exists
const serviceAccountPath = path.join(__dirname, '../service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: service-account.json not found!');
  console.log('Please download your Firebase service account key:');
  console.log('1. Go to Firebase Console');
  console.log('2. Go to Project Settings');
  console.log('3. Go to Service Accounts tab');
  console.log('4. Click "Generate New Private Key"');
  console.log('5. Save the file as service-account.json in your project root');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();
const cafes = [];
let rowCount = 0;
let skippedCount = 0;

console.log('Starting CSV import...');

// Read and parse CSV file
fs.createReadStream(path.join(__dirname, '../cc7750fc-3c57-43c3-a5f5-c2af85db4c74.csv'))
  .pipe(csv())
  .on('data', (data) => {
    rowCount++;
    if (rowCount % 1000 === 0) {
      console.log(`Processed ${rowCount} rows (${cafes.length} valid entries, ${skippedCount} skipped)...`);
    }

    // Only process if it's a cafe/restaurant from 2010 onwards
    const censusYear = parseInt(data.census_year);
    if (data.industry_anzsic4_description === 'Cafes and Restaurants' && censusYear >= 2010) {
      const cafe = {
        name: data.trading_name || '',
        address: data.building_address || '',
        city: 'Melbourne',
        state: 'VIC',
        businessAddress: data.business_address || '',
        seatingType: data.seating_type || '',
        numberOfSeats: parseInt(data.number_of_seats) || 0,
        area: data.clue_small_area || '',
        industryType: data.industry_anzsic4_description,
        latitude: parseFloat(data.latitude) || 0,
        longitude: parseFloat(data.longitude) || 0,
        censusYear: censusYear,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      cafes.push(cafe);
    } else {
      skippedCount++;
    }
  })
  .on('end', async () => {
    console.log(`\nFinished reading CSV.`);
    console.log(`Total rows processed: ${rowCount}`);
    console.log(`Valid entries (Cafes and Restaurants from 2010+): ${cafes.length}`);
    console.log(`Skipped entries: ${skippedCount}`);
    
    if (cafes.length === 0) {
      console.error('No valid venues found in CSV file');
      process.exit(1);
    }

    // Upload to Firebase in smaller batches
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    console.log('\nStarting upload to Firebase...');

    for (let i = 0; i < cafes.length; i += batchSize) {
      const batch = db.batch();
      const batchCafes = cafes.slice(i, i + batchSize);
      
      batchCafes.forEach((cafe) => {
        const docRef = db.collection('cafes').doc();
        batch.set(docRef, cafe);
      });
      
      try {
        await batch.commit();
        successCount += batchCafes.length;
        console.log(`Uploaded batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(cafes.length/batchSize)} (${successCount} total records)`);
        
        // Add a small delay between batches to prevent overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        errorCount += batchCafes.length;
        console.error(`Error uploading batch ${Math.floor(i/batchSize) + 1}:`, error);
        
        // Wait a bit longer if we encounter an error
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\nImport completed!');
    console.log(`Successfully imported: ${successCount} records`);
    console.log(`Failed to import: ${errorCount} records`);
    process.exit(0);
  })
  .on('error', (error) => {
    console.error('Error reading CSV file:', error);
    process.exit(1);
  });
 