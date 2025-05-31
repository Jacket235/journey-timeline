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

const verifyJWT = async (req, res) => {
    const token = req.headers["x-access-token"];

    if (!token) {
        res.send("No token");
    } else {
        jwt.verify(token, `${process.env.SECRETKEY}`, (err, decoded) => {
            if (err) {
                res.json({ auth: false, message: "Couldn't authenticate" });
            } else {
                req.userId = decoded.id;
            }
        });
    }
}

app.get("/isUserAuth", verifyJWT, (req, res) => {
    res.send("Authenticated.");
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const findUserQuery = "SELECT * FROM users WHERE username = ?";
    connection.query(findUserQuery, [username], async (err, result) => {
        if (err) {
            console.error("Error signing in", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.length <= 0) {
            return res.status(409).json({ error: "User doesn't exist" });
        }

        bcrypt.compare(password, result[0].password, (error, response) => {
            if (error) {
                console.error("Error comparing passwords", error);
                return res.status(500).json({ error: "Bcrypt error" });
            }

            if (response) {
                const id = result[0].id;
                const email = result[0].email;

                const token = jwt.sign({ id, email }, process.env.SECRETKEY, {
                    expiresIn: 300
                });

                res.json({ auth: true, token: token, user: { id, email } });
            } else {
                res.send({ message: "Wrong username/password" });
            }
        });
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});