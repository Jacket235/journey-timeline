require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const connection = require('./config');
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.sendStatus(400);
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
                return res.sendStatus(500);
            }

            return res.json({ success: true });
        });
    })
});

app.post("/login", (req, res) => {
    const { email, username, password } = req.body;

    const findUserQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(findUserQuery, [email], async (err, result) => {
        if (err) {
            return res.sendStatus(500);
        }

        if (result.length <= 0) {
            return res.sendStatus(409);
        }

        bcrypt.compare(password, result[0].password, (error, response) => {
            if (error) {
                return res.sendStatus(500)
            }

            if (response) {
                const accessToken = jwt.sign({ email: email, username: username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })

                res.json({ accessToken: accessToken })
            } else {
                return res.sendStatus(401);
            }
        });
    });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        req.user = user;
        next()
    })
}

app.listen(8080, () => {
    console.log(`Server is running on port 800`);
});