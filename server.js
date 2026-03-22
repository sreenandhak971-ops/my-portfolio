require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require('express');
const mysql = require('mysql2'); // Switched from sqlite3 to mysql2
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// 1. Initialize MySQL Connection
// Make sure these values match your local MySQL setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',                   // Your MySQL username
    password: 'nandha', // Add your MySQL password 
    database: 'portfolio_db'         // The name of the database you created in MySQL Workbench
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL Database!');
});

// 2. Create the Table (MySQL Syntax)
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

db.query(createTableQuery, (err) => {
    if (err) console.error("Table creation failed:", err);
});

// 3. Setup the Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 4. API Endpoint (MySQL + Nodemailer)
app.post('/api/contact', (req, res) => {
    const { name, email } = req.body;

    // First: Save to the MySQL Database
    const sqlInsert = "INSERT INTO users (name, email) VALUES (?, ?)";
    
    db.query(sqlInsert, [name, email], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send("Database save failed.");
        }

        // Second: Send the email notification
        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER, 
            subject: `New Portfolio Contact: ${name}`,
            text: `A user named ${name} (${email}) just signed up on your website!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email Error:", error);
                return res.status(200).send("Saved to MySQL, but email notification failed.");
            }
            console.log("Email sent: " + info.response);
            res.status(200).send("Success: Data saved to MySQL and Email sent!");
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
