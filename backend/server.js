const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Proposal templates
const proposalTemplates = {
    romantic: (partnerName, yourName) => `My dearest ${partnerName}, 

From the moment I first saw you, my world changed forever. Your smile lights up my darkest days, and your love has made me a better person. Today, I want to ask you the most important question of my life.

${partnerName}, will you marry me and make me the happiest person in the world?

Forever yours,
${yourName}`,
    
    funny: (partnerName, yourName) => `Hey ${partnerName}!

So I've been thinking... we already share Netflix, pizza, and the last slice of cake. It only makes sense to share a last name too!

Life with you is better than any comedy show, and I want to keep laughing with you forever.

So, ${partnerName}, will you do me the honor of becoming my legally recognized partner in crime?

Your favorite human,
${yourName}`,
    
    poetic: (partnerName, yourName) => `To ${partnerName}, my love,

Like stars that dance in midnight skies,
Your beauty shines before my eyes.
With every beat, my heart sings true,
There's no one else I'd rather choose.

Through seasons change and years may pass,
Our love will grow and forever last.
So on this day, with heart so full,

${partnerName}, my love, will you marry me?

With all my love,
${yourName}`,
    
    simple: (partnerName, yourName) => `${partnerName},

I love you more than words can say. You make every day better just by being in it.

I want to spend the rest of my life making you as happy as you make me.

Will you marry me?

Love,
${yourName}`
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.post('/api/generate-proposal', (req, res) => {
    try {
        const { partnerName, yourName, proposalStyle } = req.body;
        
        if (!partnerName || !yourName || !proposalStyle) {
            return res.status(400).json({ 
                error: 'Missing required fields: partnerName, yourName, proposalStyle' 
            });
        }
        
        if (!proposalTemplates[proposalStyle]) {
            return res.status(400).json({ 
                error: 'Invalid proposal style. Available styles: romantic, funny, poetic, simple' 
            });
        }
        
        const proposal = proposalTemplates[proposalStyle](partnerName, yourName);
        
        res.json({ 
            success: true, 
            proposal: proposal 
        });
        
    } catch (error) {
        console.error('Error generating proposal:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

app.get('/api/styles', (req, res) => {
    res.json({
        styles: Object.keys(proposalTemplates)
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Wedding Proposal Generator server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to see the application`);
});
