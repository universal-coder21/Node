const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const qr = require('qr-image');

const app = express();

// Set storage engine for Multer
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
}).single('file');

// Serve static files (HTML)
app.use(express.static('public'));

// Route to handle file upload
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.send('Error uploading file.');
        } else {
            if (req.file == undefined) {
                res.send('No file selected!');
            } else {
                // Generate QR code with file path
                const filePath = `http://localhost:3000/uploads/${req.file.filename}`;
                const qr_svg = qr.image(filePath, { type: 'svg' });
                const qrCodePath = `./uploads/qr-${Date.now()}.svg`;

                qr_svg.pipe(fs.createWriteStream(qrCodePath));

                // Send QR code to user
                qr_svg.on('end', () => {
                    res.send(`<p>File uploaded successfully!</p>
                              <p>Scan this QR code to access the file:</p>
                              <img src="${qrCodePath}" />
                              <br>
                              <a href="${filePath}" download>Download file</a>`);
                });
            }
        }
    });
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Start the server
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
