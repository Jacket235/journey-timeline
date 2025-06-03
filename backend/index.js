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

app.post("/refreshToken", (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken == null) return res.sendStatus(401);

    const query = "SELECT * FROM refresh_tokens WHERE token = ?";

    connection.query(query, [refreshToken], (err, result) => {
        if (err) return res.sendStatus(500)
        if (result.length === 0) return res.sendStatus(403);

        const expiresAt = new Date(result[0].expires_at);
        if (expiresAt < new Date()) {
            return res.status(403).json({ message: "Refresh token expired" });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);

            const accessToken = jwt.sign({ email: user.email, username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
            res.json({ accessToken: accessToken });
        })
    })
})

app.post("/logout", (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.sendStatus(400);

    const deleteQuery = "DELETE FROM refresh_tokens WHERE token = ?"
    connection.query(deleteQuery, [refreshToken], (err) => {
        if (err) return res.sendStatus(500);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "Strict"
        });

        res.sendStatus(204);
    })
})

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
                const refreshToken = jwt.sign({ email: email, username: username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" })

                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "Strict",
                    maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day
                });

                const expiresAt = dayjs().add(1, 'day').format("YYYY-MM-DD HH:mm:ss");
                const insertRefreshTokenQuery = "INSERT INTO refresh_tokens (token, user_email, expires_at) VALUES (?, ?, ?)";
                connection.query(insertRefreshTokenQuery, [refreshToken, email, expiresAt], (err) => {
                    if (err) return res.sendStatus(500);

                    res.json({ accessToken: accessToken })
                })
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