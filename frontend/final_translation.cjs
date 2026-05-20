
const fs = require('fs');
const path = require('path');

function forceReplace(file, replacements) {
    if (!fs.existsSync(file)) return;
    let t = fs.readFileSync(file, 'utf8');
    let original = t;
    for (const [k, v] of Object.entries(replacements)) {
        t = t.split(k).join(v);
    }
    if (t !== original) {
        fs.writeFileSync(file, Buffer.from(t, 'utf8'));
        console.log('Translated ' + file);
    }
}

forceReplace('frontend/src/components/ChallengesPage.tsx', {
    '>\\n            Challenges\\n          <': '>\\n            Défis\\n          <',
    'Complete your daily challenges to grow your tree and earn points.': 'Terminez vos défis quotidiens pour développer votre arbre et gagner des points.',
    'Day Streak': 'Série de jours',
    'Total Points': 'Points totaux',
    Today's Progress: 'Progression du jour',
    Today's Challenges: 'Défis du jour',
    'Your Tree is Growing': 'Votre arbre grandit',
    'to next tree': 'pour le prochain arbre',
    'Completed': 'Terminé'
});

forceReplace('frontend/src/components/CreateChallengeModal.tsx', {
    '>\\n                  Create Challenge\\n                <': '>\\n                  Créer un défi\\n                <',
    '>\\n                    Challenge Title\\n                  <': '>\\n                    Titre du défi\\n                  <',
    '>\\n                    Category\\n                  <': '>\\n                    Catégorie\\n                  <'
});

forceReplace('frontend/src/components/CommunityPage.tsx', {
    '>\\n            Join The Community\\n          <': '>\\n            Rejoindre la communauté\\n          <'
});

forceReplace('frontend/src/components/DashboardPage.tsx', {
    '>MON<': '>LUN<',
    '>JULY<': '>JUILLET<',
    '>Tips<': '>Conseils<'
});

forceReplace('frontend/src/components/Navigation.tsx', {
    'Track your carbon footprint': 'Suivez votre empreinte carbone',
    'New Challenge': 'Nouveau défi'
});

forceReplace('frontend/src/components/ProfilePage.tsx', {
    'Profile': 'Profil',
    '>Trees<': '>Arbres<',
    '>Day Streak<': '>Jours consécutifs<',
    '>\\n                Statistics\\n              <': '>\\n                Statistiques\\n              <',
    '>Challenges Completed<': '>Défis accomplis<',
    '>Best Streak<': '>Meilleure série<',
    '>CO2 Reduced This Year<': '>CO2 réduit cette année<',
    '>\\n                Achievements\\n              <': '>\\n                Succès\\n              <'
});

function cleanAccents() {
    console.log('Cleaning exact accents globally...');
    const d = fs.readdirSync('frontend/src/components', {recursive: true});
    for (let f of d) {
        if (!f.endsWith('.tsx') && !f.endsWith('.ts')) continue;
        let p = path.join('frontend/src/components', f);
        if (!fs.statSync(p).isFile()) continue;
        
        let t = fs.readFileSync(p, 'utf8');
        let original = t;

        // Common FFFD Replacements
        t = t.replace(/D\uFFFDfis/g, 'Défis');
        t = t.replace(/Communaut\uFFFD/g, 'Communauté');
        t = t.replace(/Nouveau d\uFFFDi cr\uFFFD\uFFFD:/g, 'Nouveau défi créé:');
        t = t.replace(/D\uFFFDi cr\uFFFD\uFFFD:/g, 'Défi créé:');
        t = t.replace(/Ã©/g, 'é');
        t = t.replace(/Ã¨/g, 'è');
        t = t.replace(/Ã/g, 'à');

        // General fixes for previous bad states
        t = t.replace(/Dfis/g, 'Défis');
        t = t.replace(/dfis/g, 'défis');
        t = t.replace(/Nouveau dfi cré/g, 'Nouveau défi créé');
        t = t.replace(/Dfi cré/g, 'Défi créé');

        if (t !== original) {
            fs.writeFileSync(p, Buffer.from(t, 'utf8'));
            console.log('Cleaned accents in ' + p);
        }
    }
}
cleanAccents();

