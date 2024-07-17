const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const noteRoutes = require('./routes/notes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/notes', noteRoutes);

// MongoDB connection details
const mongoUser = 'vasanth27s';
const mongoPassword = 'vasanth123';
const mongoCluster = 'cluster0.c2jsuna.mongodb.net';
const mongoDatabase = 'note-keeper';

// MongoDB connection URI
const mongoUrl = `mongodb+srv://${mongoUser}:${mongoPassword}@${mongoCluster}/${mongoDatabase}?retryWrites=true&w=majority`;

mongoose.connect(mongoUrl)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1); // Exit the process with an error code
  });

// Base route
app.get('/', (req, res) => {
  res.send('Welcome to Note Keeper API');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
