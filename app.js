const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS for templating
app.set('view engine', 'ejs');

// Middleware to serve static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // For parsing form data

// Set up session
app.use(session({
    secret: 'frh44n', // Change this to a secure random key
    resave: false,
    saveUninitialized: true,
}));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// In-memory user store (replace with a database in production)
const users = [{ username: 'admin', password: 'password' }]; // Example user

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Render the login page
app.get('/login', (req, res) => {
    res.render('login'); // Create this view next
});

// Handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = { username: user.username };
        return res.redirect('/');
    }
    res.redirect('/login'); // Redirect back if login fails
});

// Render the upload page (protected route)
app.get('/', isAuthenticated, (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading files.');
        }
        res.render('index', { files, user: req.session.user });
    });
});

// Handle file uploads (protected route)
app.post('/upload', isAuthenticated, upload.single('file'), (req, res) => {
    res.redirect('/');
});

// Handle logout
app.post('/logout', isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/login');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
