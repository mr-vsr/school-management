import express from "express";
import dotenv from "dotenv";
import { connection } from "./db.js";

dotenv.config();

const app = express();
app.use(express.json());

connection.connect();

// Add School API
app.post('/addSchool', (req, res) => {
    const { id, name, address, latitude, longitude } = req.body;

    if (!id || !name || !address || typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).send({ error: 'Invalid input data' });
    }

    const query = 'INSERT INTO schools (id, name, address, latitude, longitude) VALUES (?, ?, ?, ?, ?)';

    connection.query(query, [id, name, address, latitude, longitude], (err, result) => {
        if (err) {
            console.error('Error while adding new school:', err);
            return res.status(500).send({ error: 'Database error' });
        }
        console.log(result);
        res.status(201).send({ message: 'School added successfully', schoolId: result.id });
    });
});

// List Schools API

app.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;

    if (typeof latitude === 'undefined' || typeof longitude === 'undefined') {
        return res.status(400).send({ error: 'Latitude and longitude are required' });
    }

    const userLatitude = parseFloat(latitude);
    const userLongitude = parseFloat(longitude);

    if (isNaN(userLatitude) || isNaN(userLongitude)) {
        return res.status(400).send({ error: 'Invalid latitude or longitude' });
    }

    const query = 'SELECT * FROM schools';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error while fetching schools data:', err);
            return res.status(500).send({ error: 'Database error' });
        }

        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const toRadians = (degrees) => degrees * (Math.PI / 180);
            const R = 6371; // Radius of the Earth in km
            const dLat = toRadians(lat2 - lat1);
            const dLon = toRadians(lon1 - lon2);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Distance in km
        };

        const sortedSchools = results.sort((a, b) => {
            const distanceA = calculateDistance(userLatitude, userLongitude, a.latitude, a.longitude);
            const distanceB = calculateDistance(userLatitude, userLongitude, b.latitude, b.longitude);
            return distanceA - distanceB;
        });

        res.status(200).send(sortedSchools);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
