const express = require('express');
const cors = require('cors');
const db = require('./src/database/mySqlConnection');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Configuration
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads/projects', express.static(path.join(__dirname, 'uploads/projects')));
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads/profiles')));
app.use('/uploads/defaultAvatars', express.static(path.join(__dirname, 'uploads/defaultAvatars')));
app.use('/uploads/defaultBanners', express.static(path.join(__dirname, 'uploads/defaultBanners')));


// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Port & host
const port = process.env.SERVER_PORT ?? 3001;
const host = process.env.SERVER_HOST ?? "http://localhost";
app.listen(port, () => console.log(`URL: ${host}:${port}`));

// Database configuration/connection
const dbConfig = {
    host: process.env.DB_HOST ?? 'localhost',
    port: process.env.DB_PORT ?? 3306,
    user: process.env.DB_USER ?? 'some_user',
    password: process.env.DB_PASSWORD ?? 'some_password',
    database: process.env.DB_NAME ?? 'fundflow',
}

db.connect(dbConfig, (err) => {
    if (err) {
        console.error('Unable to connect to the database (MySQL):', err);
        process.exit(1);
    } else {
        db.get().query('SELECT NOW() as date;', function (err, rows) {
            if (err) {
                console.error('Unable to execute query to MySQL: ' + err);
                process.exit(1);
            } else {
                console.log(`MySQL: Connected to MySQL ${dbConfig.database} successfully\nDATE: ${rows[0]['date']}`);
            }
        });
    }
});

// Routes
const routes = require('./src/routes/routes');
app.use('/', routes);

// Connect to MongoDB
try {
    mongoose.connect(process.env.MONGO_URL, { dbName: 'fundflow' });

    console.log('MongoDB: Connected to MongoDB fundflow successfully');
} catch (error) {
    console.error('Error connecting to MongoDB: ', error.stack);
}