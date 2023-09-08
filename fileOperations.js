const http = require('http');
const fs = require('fs');
const qs = require('querystring');

const PORT = 3000;

//<"filename">
const filePath = 'example.txt';

// Reads the file
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    let fileContent = data;

    // Create an HTTP server
    const server = http.createServer((req, res) => {
        if (req.url === '/') {
            //HOME PAGE
            // Serve an HTML page with the current file content and forms to update and delete it
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(`
                <html>
                    <body>
                        <h1>Project-Node Basic</h1>
                        <h2>File Content:</h2>
                        <p>${fileContent}</p>
                        <form method="POST" action="/update">
                            <label for="newContent">New Content:</label>
                            <textarea name="newContent" id="newContent"></textarea>
                            <button type="submit">Update File</button>
                        </form>
                        <form method="POST" action="/delete">
                            <button type="submit">Delete File</button>
                        </form>
                    </body>
                </html>
            `);
            res.end();
        } else if (req.url === '/update' && req.method === 'POST') {
            // Handle the form submission to update the file content
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                const postData = qs.parse(body);
                const newContent = postData.newContent;

                // Updates the file content
                fs.writeFile(filePath, newContent, 'utf8', (err) => {
                    if (err) {
                        console.error('Error updating the file:', err);
                        return;
                    }
                    console.log('File updated successfully.');
                    // Redirect back to the main page after updating the file
                    fileContent = newContent;
                    res.writeHead(302, { 'Location': '/' });
                    res.end();
                });
            });
        } else if (req.url === '/delete') {
            // Handle the DELETE request to delete the file
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting the file:', err);
                    return;
                }
                console.log('File deleted successfully.');
                // Redirect to a confirmation page after deleting the file
                res.writeHead(302, { 'Location': '/deleted' });
                res.end();
            });

            //
        } else if (req.url === '/deleted') {
            //DELETED FILE PAGE
            // Confirmation page after deleting the file
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(`
            <html>
                <body>
                    <h1>File Deleted</h1>
                    <p>The file has been deleted.</p>
                </body>
            </html>
            `);
            res.end();
         } else {
            // Handle other routes
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('Not Found');
            res.end();
        }
    });

    // Start the HTTP server
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
