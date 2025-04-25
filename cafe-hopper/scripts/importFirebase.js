const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Sample users data
const users = [
    { id: 'u1', name: 'Alice', location: '1', avatar: 'https://i.pravatar.cc/150?img=1', friends: ['u2', 'u3'] },
    { id: 'u2', name: 'Bob', location: '2', avatar: 'https://i.pravatar.cc/150?img=2', friends: ['u3', 'u5'] },
    { id: 'u3', name: 'Charlie', location: '1', avatar: 'https://i.pravatar.cc/150?img=3', friends: ['u1', 'u4'] },
    { id: 'u4', name: 'Dana', location: null, avatar: 'https://i.pravatar.cc/150?img=4', friends: ['u2', 'u6'] },
    { id: 'u5', name: 'Erin', location: '3', avatar: 'https://i.pravatar.cc/150?img=5', friends: ['u1', 'u4'] },
    { id: 'u6', name: 'Frank', location: null, avatar: 'https://i.pravatar.cc/150?img=6', friends: ['u3', 'u5'] },
];

// Sample reviews data
const reviews = [
    { cafeId: '1', userId: 'u5', comment: 'Fun place with great food.', ratings: { ambience: 4, service: 5, sound: 3, drinks: 4 } },
    { cafeId: '1', userId: 'u2', comment: 'Perfect coffee on the go.', ratings: { ambience: 5, service: 4, sound: 5, drinks: 5 } },
    { cafeId: '1', userId: 'u4', comment: 'Best bagels in the CBD!', ratings: { ambience: 4, service: 4, sound: 3, drinks: 4 } },
    { cafeId: '2', userId: 'u5', comment: 'Great atmosphere!', ratings: { ambience: 5, service: 4, sound: 4, drinks: 5 } },
    { cafeId: '2', userId: 'u3', comment: 'Love their coffee.', ratings: { ambience: 4, service: 5, sound: 3, drinks: 5 } },
    { cafeId: '3', userId: 'u1', comment: 'Amazing service!', ratings: { ambience: 5, service: 5, sound: 4, drinks: 4 } },
];

async function importData() {
    try {
        // Import users
        for (const user of users) {
            await db.collection('users').doc(user.id).set({
                name: user.name,
                location: user.location,
                avatar: user.avatar,
                friends: user.friends
            });
        }

        // Import reviews
        for (const review of reviews) {
            await db.collection('reviews').add({
                cafeId: review.cafeId,
                userId: review.userId,
                comment: review.comment,
                ratings: review.ratings,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        console.log('Data imported successfully');
    } catch (error) {
        console.error('Error importing data:', error);
    } finally {
        process.exit();
    }
}

importData(); 