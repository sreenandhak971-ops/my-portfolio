const nodemailer = require('nodemailer');
const express = require('express');
const sqlite3 = require('sqlite3').verbose(); // Fixed typo from 'sqlicte3'
const cors = require('cors');
require('dotenv').config(); // Important: Added this to read your .env file

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// 1. Initialize Database
const db = new sqlite3.Database('./database.db');
db.run("CREATE TABLE IF NOT EXISTS users (name TEXT, email TEXT)");

// 2. Setup the Email Transporter (The Mailman)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email from .env
        pass: process.env.EMAIL_PASS  // Your App Password from .env
    }
});

// 3. Updated API Endpoint (Handles both Database and Email)
app.post('/api/contact', (req, res) => {
    const { name, email } = req.body;

    // First: Save to the Database
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], (err) => {
        if (err) return res.status(500).send(err);

        // Second: If database save was successful, send the email
        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER, 
            subject: `New Contact: ${name}`,
            text: `A user named ${name} (${email}) just signed up on your website!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email Error:", error);
                // We still send 200 because the database part worked
                return res.status(200).send("Saved to DB, but email failed.");
            }
            console.log("Email sent: " + info.response);
            res.status(200).send("Success: Data saved and Email sent!");
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
