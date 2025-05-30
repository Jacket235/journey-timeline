require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connection = require('./config');

const app = express();

app.use(cors());
app.use(express.json());

app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;

    console.log("Username: " + username);
    console.log("Email: " + email);
    console.log("Password: " + password);

    res.status(201).json({ message: "User registered", nick: username, mail: email, pass: password });
    // const query = "INSERT INTO users (username, password) VALUES (?, ?, ?)"
    // connection.query(query, [username, password]);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});