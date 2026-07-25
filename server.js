const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('./subsidies.db', (err) => {
    if (err) console.error('Database connection failed:', err);
    else console.log('Connected to SQLite database.');
});

// Initialize database tables & seed data
db.serialize(() => {
    // Scheme Table
    db.run(`CREATE TABLE IF NOT EXISTS schemes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        title TEXT,
        category TEXT,
        benefit TEXT,
        status TEXT,
        description TEXT,
        department TEXT,
        eligibility TEXT,
        documents TEXT
    )`);

    // Applications Table
    db.run(`CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme_slug TEXT,
        full_name TEXT,
        mobile TEXT,
        state TEXT,
        consumer_no TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert initial schemes if table is empty
    db.get('SELECT COUNT(*) as count FROM schemes', (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare(`INSERT INTO schemes (slug, title, category, benefit, status, description, department, eligibility, documents) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            
            stmt.run(
                'solar',
                'PM Surya Ghar Scheme',
                'Energy & Solar',
                'Up to ₹78,000',
                'Active',
                'Get rooftop solar installation with high government financial assistance up to ₹78,000.',
                'Ministry of New and Renewable Energy',
                'Must be an Indian citizen|Must own a suitable roof|Must have an active electricity connection',
                'Aadhaar Card,Electricity Bill,Bank Passbook,Proof of Roof Ownership'
            );

            stmt.run(
                'kisan',
                'PM Kisan Samman Nidhi',
                'Agriculture',
                '₹6,000 / Year',
                'Active',
                'Direct financial support of ₹6,000 per year paid in three equal installments to small farmer families.',
                'Ministry of Agriculture & Farmers Welfare',
                'Small and marginal farmer families|Landholding must be in applicant name|Valid bank account linked with Aadhaar',
                'Aadhaar Card,Land Ownership Papers,Bank Account Details'
            );

            stmt.run(
                'housing',
                'PMAY Housing Subsidy',
                'Housing',
                'Interest Subsidy',
                'Active',
                'Credit-linked subsidy scheme providing lower interest rates on home loans for first-time buyers.',
                'Ministry of Housing and Urban Affairs',
                'Annual household income within specified slab|Applicant must not own a pucca house in India',
                'Aadhaar Card,Income Certificate,Bank Statement,Property Agreement'
            );

            stmt.finalize();
        }
    });
});

// API Routes

// 1. Get All Schemes (Page 1)
app.get('/api/schemes', (req, res) => {
    db.all('SELECT id, slug, title, category, benefit, status, description FROM schemes', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. Get Single Scheme Details by Slug (Page 2)
app.get('/api/schemes/:slug', (req, res) => {
    const slug = req.params.slug;
    db.get('SELECT * FROM schemes WHERE slug = ?', [slug], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Scheme not found' });
        res.json(row);
    });
});

// 3. Submit Scheme Application Form (Backend storage)
app.post('/api/apply', (req, res) => {
    const { scheme_slug, full_name, mobile, state, consumer_no } = req.body;

    if (!scheme_slug || !full_name || !mobile || !state || !consumer_no) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const query = `INSERT INTO applications (scheme_slug, full_name, mobile, state, consumer_no) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [scheme_slug, full_name, mobile, state, consumer_no], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Database error.' });
        res.json({ success: true, applicationId: this.lastID, message: 'Application submitted successfully!' });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});