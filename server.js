const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./subsidies.db', (err) => {
    if (err) console.error('Database error:', err);
    else console.log('Connected to SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS schemes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        title_en TEXT, title_hi TEXT, title_mr TEXT,
        category_en TEXT, category_hi TEXT, category_mr TEXT,
        benefit_en TEXT, benefit_hi TEXT, benefit_mr TEXT,
        status TEXT,
        desc_en TEXT, desc_hi TEXT, desc_mr TEXT,
        dept_en TEXT, dept_hi TEXT, dept_mr TEXT,
        eligibility_en TEXT, eligibility_hi TEXT, eligibility_mr TEXT,
        documents_en TEXT, documents_hi TEXT, documents_mr TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme_slug TEXT,
        full_name TEXT,
        mobile TEXT,
        state TEXT,
        consumer_no TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert schemes with English, Hindi, and Marathi translations
    db.get('SELECT COUNT(*) as count FROM schemes', (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare(`INSERT INTO schemes (
                slug, title_en, title_hi, title_mr,
                category_en, category_hi, category_mr,
                benefit_en, benefit_hi, benefit_mr, status,
                desc_en, desc_hi, desc_mr,
                dept_en, dept_hi, dept_mr,
                eligibility_en, eligibility_hi, eligibility_mr,
                documents_en, documents_hi, documents_mr
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

            // Scheme 1: Solar
            stmt.run(
                'solar',
                'PM Surya Ghar Scheme', 'पीएम सूर्य घर योजना', 'पीएम सूर्य घर योजना',
                'Energy & Solar', 'ऊर्जा और सौर', 'ऊर्जा आणि सौर',
                'Up to ₹78,000', '₹78,000 तक', '₹७८,००० पर्यंत', 'Active',
                'Get rooftop solar installation with high subsidy assistance.', 
                'रूफटॉप सोलर इंस्टॉलेशन पर भारी सरकारी सब्सिडी पाएं।', 
                'छतावर सोलर पॅनेल बसवण्यासाठी मोठी शासकीय सबसिडी मिळवा.',
                'Ministry of New & Renewable Energy', 'नवीन और नवीकरणीय ऊर्जा मंत्रालय', 'नवीन आणि नवकरणीय ऊर्जा मंत्रालय',
                'Indian Citizen|Own roof space|Active electricity connection',
                'भारतीय नागरिक|अपनी छत की जगह|सक्रिय बिजली कनेक्शन',
                'भारतीय नागरिक|स्वतःच्या छताची जागा|सक्रिय वीज जोडणी',
                'Aadhaar Card, Electricity Bill, Bank Passbook',
                'आधार कार्ड, बिजली बिल, बैंक पासबुक',
                'आधार कार्ड, वीज बिल, बँक पासबुक'
            );

            // Scheme 2: Kisan
            stmt.run(
                'kisan',
                'PM Kisan Samman Nidhi', 'पीएम किसान सम्मान निधि', 'पीएम किसान सन्मान निधी',
                'Agriculture', 'कृषि', 'कृषी',
                '₹6,000 / Year', '₹6,000 / वर्ष', '₹६,००० / वर्ष', 'Active',
                'Direct income support for farmer families.',
                'किसान परिवारों के लिए सीधी वित्तीय सहायता।',
                'शेतकरी कुटुंबांसाठी थेट आर्थिक मदत.',
                'Ministry of Agriculture', 'कृषि मंत्रालय', 'कृषी मंत्रालय',
                'Small & marginal farmers|Land in applicant name',
                'छोटे और सीमांत किसान|आवेदक के नाम पर भूमि',
                'लहान आणि अल्पभूधारक शेतकरी|अर्जादाराच्या नावावर जमीन',
                'Aadhaar Card, Land Papers, Bank Passbook',
                'आधार कार्ड, भूमि दस्तावेज, बैंक पासबुक',
                'आधार कार्ड, जमिनीची कागदपत्रे, बँक पासबुक'
            );

            // Scheme 3: Ladki Bahin (Maharashtra Specific)
            stmt.run(
                'ladki-bahin',
                'Mukhyamantri Majhi Ladki Bahin Yojana', 'मुख्यमंत्री माझी लाड़की बहिन योजना', 'मुख्यमंत्री माझी लाडकी बहीण योजना',
                'Women Welfare', 'महिला कल्याण', 'महिला कल्याण',
                '₹1,500 / Month', '₹1,500 / माह', '₹१,५०० / महिना', 'Active',
                'Financial independence scheme for eligible women in Maharashtra.',
                'महाराष्ट्र में महिलाओं की वित्तीय स्वतंत्रता के लिए योजना।',
                'महाराष्ट्रातील महिलांच्या आर्थिक स्वावलंबनासाठी योजना.',
                'Dept of Women & Child Development', 'महिला एवं बाल विकास विभाग', 'महिला व बाल विकास विभाग',
                'Women aged 21-65|Maharashtra Resident|Income < 2.5 Lakh',
                'महिला आयु 21-65|महाराष्ट्र निवासी|आय < 2.5 लाख',
                'महिला वय २१-६५|महाराष्ट्र रहिवासी|उत्पन्न < २.५ लाख',
                'Aadhaar Card, Income Certificate, Domicile, Bank Passbook',
                'आधार कार्ड, आय प्रमाण पत्र, अधिवास प्रमाण पत्र, बैंक पासबुक',
                'आधार कार्ड, उत्पन्नाचा दाखला, अधिवास दाखला, बँक पासबुक'
            );

            // Scheme 4: Kisan Credit Card
            stmt.run(
                'kcc',
                'Kisan Credit Card (KCC)', 'किसान क्रेडिट कार्ड', 'किसान क्रेडिट कार्ड',
                'Agriculture Loan', 'कृषि ऋण', 'कृषी कर्ज',
                'Up to ₹3 Lakh @ 4%', '₹3 लाख तक @ 4%', '₹३ लाखांपर्यंत @ ४%', 'Active',
                'Short-term formal credit for farmers at low interest rates.',
                'कम ब्याज दरों पर किसानों के लिए रियायती ऋण।',
                'कमी व्याजदरात शेतकऱ्यांसाठी अल्पमुदतीचे कर्ज.',
                'NABARD / Ministry of Finance', 'नाबार्ड / वित्त मंत्रालय', 'नाबार्ड / वित्त मंत्रालय',
                'Farmers/Cultivators|Tenant Farmers|SHGs',
                'किसान/खेतीहर|बटाईदार किसान|स्वयं सहायता समूह',
                'शेतकरी/कापणीदार|कुळ शेतकरी|बचत गट',
                'Aadhaar Card, Land Record (7/12), Passport Photo',
                'आधार कार्ड, भूमि रिकॉर्ड (7/12), पासपोर्ट फोटो',
                'आधार कार्ड, जमिनीचा उतारा (७/१२), पासपोर्ट फोटो'
            );

            stmt.finalize();
        }
    });
});

app.get('/api/schemes', (req, res) => {
    db.all('SELECT * FROM schemes', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/schemes/:slug', (req, res) => {
    db.get('SELECT * FROM schemes WHERE slug = ?', [req.params.slug], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.post('/api/apply', (req, res) => {
    const { scheme_slug, full_name, mobile, state, consumer_no } = req.body;
    db.run(`INSERT INTO applications (scheme_slug, full_name, mobile, state, consumer_no) VALUES (?, ?, ?, ?, ?)`, 
    [scheme_slug, full_name, mobile, state, consumer_no], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Error saving application' });
        res.json({ success: true, applicationId: this.lastID });
    });
});

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
