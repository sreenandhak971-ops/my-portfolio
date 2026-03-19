const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Initialize Database
const db = new sqlite3.Database('./database.db');
db.run("CREATE TABLE IF NOT EXISTS users (name TEXT, email TEXT)");

// API Endpoint to receive form data
app.post('/api/contact', (req, res) => {
    const { name, email } = req.body;
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], (err) => {
        if (err) return res.status(500).send(err);
        res.status(200).send("Success");
    });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
