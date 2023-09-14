const http = require('http');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');

const dataFilePath = path.join(__dirname, 'users.json');
let fileData = []; // Initialize as an empty array

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        // Serve an HTML form for adding JSON objects
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Add User</title>
            </head>
            <body>
                <h1>Add User</h1>
                <form method="POST" action="/add-user">
                    <label for="id">ID:</label>
                    <input type="text" id="id" name="id" required><br>

                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" required><br>

                    <button type="submit">Add User</button>
                </form>
                <h2>Current Users</h2>
                <ul><!-- Displays each user from a json file with map method -->
                    ${fileData.map(user => `
                    <li>
                        id: ${user.id}, 
                        name: ${user.name}
                    </li>
                    `).join('')}
                </ul>
            </body>
            </html>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else if (req.method === 'POST' && req.url === '/add-user') {
        // Handle the form submission to add a new JSON object
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const formData = qs.parse(body);
            const newUserData = {
                id: formData.id,
                name: formData.name,
            };
            // Add the new user object to 'fileData' array
            fileData.push(newUserData);

            // Save the updated data to a JSON file (optional)
            fs.writeFileSync(dataFilePath, JSON.stringify(fileData, null, 2), 'utf8');

            res.writeHead(302, { 'Location': '/' }); // Redirect to the main page
            res.end();
        });
    } else if (req.url === '/api/users') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(fileData, null, 2)); // Respond with 'fileData' as JSON
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Initialize 'fileData' with existing JSON data or an empty array
fileData = fs.existsSync(dataFilePath)
    ? JSON.parse(fs.readFileSync(dataFilePath, 'utf8'))
    : [];

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
