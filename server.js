require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// 1. Initialize MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'nandha', 
    database: 'portfolio_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL Database!');
});

// 2. Create the Table (Including Message column)
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

db.query(createTableQuery, (err) => {
    if (err) console.error("Table creation failed:", err);
});

// 3. API Endpoint (MySQL only - since Formspree handles the email now)
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    const sqlInsert = "INSERT INTO users (name, email, message) VALUES (?, ?, ?)";
    
    db.query(sqlInsert, [name, email, message], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send("Database save failed.");
        }
        console.log("Data saved to MySQL for:", name);
        res.status(200).send("Success: Data saved to MySQL!");
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));