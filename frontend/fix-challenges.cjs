const fs = require('fs');
let t = fs.readFileSync('src/components/ChallengesPage.tsx', 'utf8');

const r = {
    ">\n            Challenges\n          <": ">\n            Défis\n          <",
    "Complete your daily challenges to grow your tree and earn points.": "Terminez vos défis quotidiens pour développer votre arbre et gagner des points.",
    ">Day Streak<": ">Série de jours<",
    ">Total Points<": ">Points totaux<",
    ">Today's Progress<": ">Progression du jour<",
    ">Today's Challenges<": ">Défis du jour<",
    ">Your Tree is Growing<": ">Votre arbre grandit<",
    "to next tree": "pour le prochain arbre",
    ">Completed<": ">Terminé<",
    ">Food<": ">Alimentation<",
    ">Transport<": ">Transport<",
    ">Consumption<": ">Consommation<",
    ">All Categories<": ">Toutes catégories<",
    ">Filter by category<": ">Filtrer par catégorie<",
    ">Active Challenges<": ">Défis Actifs<",
    "Complete": "Terminer",
    "} Arbres": "} Arbres"
    
};
for(let k in r) t = t.split(k).join(r[k]);

t = t.replace(/Å°/g, '°')
    .replace(/\uFFFD/g, 'é')
    .replace(/Éĺnergie/g, 'Énergie')
    .replace(/ÉĹenergie/g, 'Énergie')
    .replace(/Ä╠teindre/g, 'Éteindre')
    .replace(/ÄĹrobust/g, '