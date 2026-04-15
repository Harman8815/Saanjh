document.addEventListener('DOMContentLoaded', function() {
    const proposalForm = document.getElementById('proposalForm');
    const proposalDisplay = document.getElementById('proposalDisplay');
    const proposalText = document.getElementById('proposalText');
    const regenerateBtn = document.getElementById('regenerateBtn');

    proposalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        generateProposal();
    });

    regenerateBtn.addEventListener('click', generateProposal);

    function generateProposal() {
        const partnerName = document.getElementById('partnerName').value;
        const yourName = document.getElementById('yourName').value;
        const proposalStyle = document.getElementById('proposalStyle').value;

        let proposal = '';

        switch(proposalStyle) {
            case 'romantic':
                proposal = `My dearest ${partnerName}, 

From the moment I first saw you, my world changed forever. Your smile lights up my darkest days, and your love has made me a better person. Today, I want to ask you the most important question of my life.

${partnerName}, will you marry me and make me the happiest person in the world?

Forever yours,
${yourName}`;
                break;

            case 'funny':
                proposal = `Hey ${partnerName}!

So I've been thinking... we already share Netflix, pizza, and the last slice of cake. It only makes sense to share a last name too!

Life with you is better than any comedy show, and I want to keep laughing with you forever.

So, ${partnerName}, will you do me the honor of becoming my legally recognized partner in crime?

Your favorite human,
${yourName}`;
                break;

            case 'poetic':
                proposal = `To ${partnerName}, my love,

Like stars that dance in midnight skies,
Your beauty shines before my eyes.
With every beat, my heart sings true,
There's no one else I'd rather choose.

Through seasons change and years may pass,
Our love will grow and forever last.
So on this day, with heart so full,

${partnerName}, my love, will you marry me?

With all my love,
${yourName}`;
                break;

            case 'simple':
                proposal = `${partnerName},

I love you more than words can say. You make every day better just by being in it.

I want to spend the rest of my life making you as happy as you make me.

Will you marry me?

Love,
${yourName}`;
                break;
        }

        proposalText.textContent = proposal;
        proposalDisplay.style.display = 'block';
        proposalDisplay.scrollIntoView({ behavior: 'smooth' });
    }
});
