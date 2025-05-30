require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connection = require('./config');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/user', (req, res) => {
    const query = 'SELECT * FROM users LIMIT 1';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results[0] || {});
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});