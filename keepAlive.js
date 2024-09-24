const axios = require('axios');

// Replace with your website URL
const url = 'https://yakeen-neet.onrender.com';

setInterval(() => {
    axios.get(url)
        .then(response => {
            console.log(`Website is active: ${response.status}`);
        })
        .catch(error => {
            console.error(`Error keeping the website active: ${error.message}`);
        });
}, 5 * 60 * 1000); // Ping every 5 minutes
