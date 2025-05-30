require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connection = require('./config');

const app = express();

app.use(cors());
app.use(express.json());

app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;

    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
    connection.query(query, [username, email, password], (err, result) => {
        if (err) {
            console.error("Error signing up", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.status(201).send("Registered");
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});