require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const connection = require('./config');
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");

const app = express();

app.use(cors({
    origin: 'https://jacket235.github.io'
}));

app.use(express.json());

app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) return res.json({ success: false, message: "Missing username, email or password." });

    const checkQuery = "SELECT * FROM users WHERE username = ? OR email = ?";
    connection.query(checkQuery, [username, email], async (err, result) => {
        if (err) return res.json({ success: false, message: "Database error. Failed to check for existing user." });

        if (result.length > 0) return res.json({ success: false, message: "Username or E-mail taken" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
        connection.query(insertQuery, [username, email, hashedPassword], (err, result) => {
            if (err) return res.json({ success: false, message: "Database error. Failed to create user." });

            return res.json({ success: true, message: "" });
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

app.post("/syncevents", authenticateToken, (req, res) => {
    const { added = [], modified = [], removed = [] } = req.body;
    const userId = req.user.user_id;

    if (!added.length && !modified.length && !removed.length) return res.json({ message: "No changes to events" });

    const promises = [];

    const addEventQuery = "INSERT INTO events (name, step_id, user_id, position) VALUES (?, ?, ?, ?)";
    for (const event of added) {
        promises.push(new Promise((resolve, reject) => {
            connection.query(addEventQuery, [event.name, event.step_id, userId, event.position], (err) => {
                if (err) return reject(err);
                resolve(null);
            });
        }));
    }

    const modifyEventQuery = "UPDATE events SET name = ?, step_id = ?, position = ? WHERE id = ? AND user_id = ?";
    for (const event of modified) {
        promises.push(new Promise((resolve, reject) => {
            connection.query(modifyEventQuery, [event.name, event.step_id, event.position, event.id, userId], (err) => {
                if (err) return reject(err);
                resolve(null);
            });
        }));
    }

    const removeEventQuery = "DELETE FROM events WHERE id = ? AND user_id = ?";
    for (const event of removed) {
        promises.push(new Promise((resolve, reject) => {
            connection.query(removeEventQuery, [event.id, userId], (err) => {
                if (err) return reject(err);
                resolve(null);
            });
        }));
    }

    Promise.all(promises)
        .then(() => res.json({ message: "Events synced successfully" }))
        .catch(err => {
            console.error("Sync events error:", err);
            res.sendStatus(500);
        });
});

app.post("/syncconnections", authenticateToken, (req, res) => {
    const { connected = [], disconnected = [] } = req.body;
    const userId = req.user.user_id;

    if (!connected.length && !disconnected.length) return res.json({ message: "No changes to connections" });

    const promises = [];

    const addConnectionQuery = "INSERT INTO connections (from_event_id, to_event_id, user_id) VALUES (?, ?, ?)";
    for (const conn of connected) {
        promises.push(new Promise((resolve, reject) => {
            connection.query(addConnectionQuery, [conn.from_event_id, conn.to_event_id, userId], (err) => {
                if (err) return reject(err);
                resolve(null);
            });
        }));
    }

    const removeConnectionQuery = "DELETE FROM connections WHERE from_event_id = ? AND to_event_id = ? AND user_id = ?";
    for (const conn of disconnected) {
        promises.push(new Promise((resolve, reject) => {
            connection.query(removeConnectionQuery, [conn.from_event_id, conn.to_event_id, userId], (err) => {
                if (err) return reject(err);
                resolve(null);
            });
        }));
    }

    Promise.all(promises)
        .then(() => res.json({ message: "Connections synced successfully" }))
        .catch(err => {
            console.error("Sync connections error:", err);
            res.sendStatus(500);
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
    console.log(`Server is running on port 8080`);
});
