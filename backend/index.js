require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const connection = require('./config');

const app = express();

app.use(cors());
app.use(express.json());

app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const checkQuery = "SELECT * FROM users WHERE username = ? OR email = ?";
    connection.query(checkQuery, [username, email], async (err, result) => {
        if (err) {
            console.error("Error signing up", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.length > 0) {
            return res.status(409).json({ error: "Username or E-mail taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
        connection.query(insertQuery, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error("Error signing up", err);
                return res.status(500).json({ error: "Database error" });
            }

            res.status(201).send("Registered");
        });
    })
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});