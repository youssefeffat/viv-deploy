
const fs = require('fs');
const path = require('path');

function replaceInFile(relativePath, replacements) {
    const file = path.join('frontend', 'src', 'components', relativePath);
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    for (const [search, replace] of Object.entries(replacements)) {
        content = content.replace(new RegExp(search, 'g'), replace);
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed ' + relativePath);
}

replaceInFile('ProfilePage.tsx', {
    '>Eco Profile<': '>Profil Éco<',
    '>Edit<': '>Modifier<',
    '>Environmental Impact<': '>Impact Environnemental<',
    '>Trees planted<': '>Arbres plantés<',
    '>Badges Earned<': '>Badges Gagnés<',
    '>Monthly Goal<': '>Objectif Mensuel<',
    '>Global Rank<': '>Classement Mondial<',
    '>Impact limit<': '>Limite d\\'impact<',
    '>Trees Planted<': '>Arbres Plantés<',
    '>Eco-Score<': '>Éco-Score<',
    '>Current Streak<': '>Série Actuelle<'
});

replaceInFile('ChallengesPage.tsx', {
    '>Active Challenges<': '>Défis Actifs<',
    '>Filter by category<': '>Filtrer par catégorie<',
    '>Points<': '>Points<',
    '>Create<': '>Créer<',
    '>Complete<': '>Terminer<',
    '>Completed<': '>Terminé<',
    '>All Categories<': '>Toutes catégories<',
    '>Food<': '>Alimentation<',
    '>Transport<': '>Transport<',
    '>Energy<': '>Énergie<',
    '>Consumption<': '>Consommation<'
});

