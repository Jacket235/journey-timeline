require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const connection = require('./config');
const jwt = require("jsonwebtoken");

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
            return res.status(500).json({ success: false, error: "Database error" });
        }

        if (result.length > 0) {
            return res.status(409).json({ success: false, error: "Username or E-mail taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
        connection.query(insertQuery, [username, email, hashedPassword], (err, result) => {
            if (err) {
                return res.setStatus(500);
            }

            return res.json({ success: true });
        });
    })
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const findUserQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(findUserQuery, [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }

        if (result.length <= 0) {
            return res.status(409).json({ error: "Unable to find user" });
        }

        bcrypt.compare(password, result[0].password, (error, response) => {
            if (error) {
                console.error("Error comparing passwords", error);
                return res.status(500).json({ error: "Bcrypt error" });
            }

            if (response) {
                const id = result[0].id;
                const username = result[0].username;
                const email = result[0].email;

                const token = jwt.sign({ id, email }, process.env.SECRETKEY, {
                    expiresIn: 300
                });

                res.json({ auth: true, token: token, user: { id, username, email } });
            } else {
                res.send({ auth: false, message: "Wrong username/password" });
            }
        });
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});