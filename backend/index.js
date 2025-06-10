require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const connection = require('./config');
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
// const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({
    origin: 'https://jacket235.github.io' // <-- your allowed origin
}));

app.use(express.json());
// app.use(cookieParser());

app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) return res.sendStatus(400);

    const checkQuery = "SELECT * FROM users WHERE username = ? OR email = ?";
    connection.query(checkQuery, [username, email], async (err, result) => {
        if (err) return res.status(500).json({ success: false, error: "Database error" });

        if (result.length > 0) return res.status(409).json({ success: false, error: "Username or E-mail taken" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
        connection.query(insertQuery, [username, email, hashedPassword], (err, result) => {
            if (err) return res.sendStatus(500);

            return res.json({ success: true });
        });
    })
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const findUserQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(findUserQuery, [email], (err, userResult) => {
        if (err) return res.sendStatus(500);

        if (userResult.length <= 0) return res.sendStatus(401);

        const user = userResult[0];

        bcrypt.compare(password, user.password, (error, response) => {
            if (error) return res.sendStatus(500);

            if (response) {
                const checkForExistingTokenQuery = "SELECT * FROM refresh_tokens WHERE user_email = ?"

                connection.query(checkForExistingTokenQuery, [email], (err, result) => {
                    if (err) return res.sendStatus(500);

                    const accessToken = jwt.sign({ user_id: user.id, email: email, username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })

                    if (result.length > 0) return res.json({ accessToken, refreshToken: result[0].token });

                    const addRefreshTokenQuery = "INSERT INTO refresh_tokens (token, user_email, expires_at) VALUES (?, ?, ?) ";

                    const expiresAt = dayjs().add(7, 'day').toDate();
                    const refreshToken = jwt.sign({ user_id: user.id, email: email, username: user.username }, process.env.REFRESH_TOKEN_SECRET)

                    connection.query(addRefreshTokenQuery, [refreshToken, email, expiresAt], (err) => {
                        if (err) return res.sendStatus(500);

                        // res.cookie("refreshToken", refreshToken, {
                        //     httpOnly: true,
                        //     secure: true,
                        //     sameSite: "none",
                        //     maxAge: 7 * 24 * 60 * 60 * 1000
                        // });
                        // Unfortunately cookies won't work as my backend and frontend are on different domains.

                        res.json({ accessToken, refreshToken })
                    });
                });

            } else {
                return res.sendStatus(401);
            }
        });
    });
});

app.post("/autologin", (req, res) => {
    const { token } = req.body;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);

        const accessToken = jwt.sign({ user_id: decoded.user_id, email: decoded.email, username: decoded.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

        res.json({ accessToken });
    });
})

app.post("/logout", (req, res) => {
    const { email } = req.body;

    const findUserQuery = "SELECT * FROM refresh_tokens WHERE user_email = ?";
    connection.query(findUserQuery, [email], (err, result) => {
        if (err) return res.sendStatus(500);

        if (result.length <= 0) return res.sendStatus(409);

        const deleteQuery = "DELETE FROM refresh_tokens WHERE user_email = ?";
        connection.query(deleteQuery, [email], (err) => {
            if (err) return res.sendStatus(500);

            return res.sendStatus(200);
        });
    });
})

app.get("/gettimelinedata", authenticateToken, (req, res) => {
    const userId = req.user.user_id;

    const getEventsQuery = "SELECT * FROM events WHERE user_id = ?";
    const getConnectionsQuery = "SELECT * FROM connections WHERE user_id = ?";

    connection.query(getEventsQuery, [userId], (err, eventsResult) => {
        if (err) return res.sendStatus(500);

        connection.query(getConnectionsQuery, [userId], (err, connectionsResult) => {
            if (err) return res.sendStatus(500)

            res.json({
                events: eventsResult,
                connections: connectionsResult
            });
        })
    })
})

app.post("/removeevent", authenticateToken, (req, res) => {
    res.json({ message: "dupa" });
})

app.post("/removeconnection", authenticateToken, (req, res) => {
    res.json({ message: "dupa" });
})

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
    console.log(`Server is running on port 8080`);
});