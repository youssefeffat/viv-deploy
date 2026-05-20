
const fs = require('fs');
const path = require('path');

function forceReplace(file, search, replace) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(search, replace);
    fs.writeFileSync(file, content, 'utf8');
}

forceReplace('frontend/src/components/ChallengesPage.tsx', /Challenges/g, 'Défis');
forceReplace('frontend/src/components/ChallengesPage.tsx', /Complete your daily challenges to grow your tree and earn points./g, 'Terminez vos défis quotidiens pour faire pousser votre arbre et gagner des points.');
forceReplace('frontend/src/components/ChallengesPage.tsx', /Day Streak/g, 'Jours consécutifs');
forceReplace('frontend/src/components/ChallengesPage.tsx', /Total Points/g, 'Points totaux');
forceReplace('frontend/src/components/ChallengesPage.tsx', /Today's Progress/g, 'Progression du jour');
forceReplace('frontend/src/components/ChallengesPage.tsx', /Today's Challenges/g, 'Défis du jour');
forceReplace('frontend/src/components/ChallengesPage.tsx', /Your Tree is Growing/g, 'Votre arbre pousse');
forceReplace('frontend/src/components/ChallengesPage.tsx', /to next tree/g, 'pour le prochain arbre');

forceReplace('frontend/src/components/CommunityPage.tsx', /Join The Community/g, 'Rejoindre la communauté');

forceReplace('frontend/src/components/CreateChallengeModal.tsx', /Create Challenge/g, 'Créer un défi');
forceReplace('frontend/src/components/CreateChallengeModal.tsx', /Challenge Title/g, 'Titre du défi');

forceReplace('frontend/src/components/DashboardPage.tsx', /Tips/g, 'Conseils');
forceReplace('frontend/src/components/DashboardPage.tsx', /Use Public Transport/g, 'Utiliser les transports en commun');
forceReplace('frontend/src/components/DashboardPage.tsx', /Choose public transport or carpooling to reduce emissions./g, 'Choisissez les transports en commun ou le covoiturage pour réduire les émissions.');
forceReplace('frontend/src/components/DashboardPage.tsx', />JULY</g, '>JUILLET<');

forceReplace('frontend/src/components/Navigation.tsx', /Track your carbon footprint/g, 'Suivez votre empreinte carbone');
forceReplace('frontend/src/components/Navigation.tsx', /New Challenge/g, 'Nouveau défi');

forceReplace('frontend/src/components/ProfilePage.tsx', />Profile</g, '>Profil<');
forceReplace('frontend/src/components/ProfilePage.tsx', />Trees</g, '>Arbres<');
forceReplace('frontend/src/components/ProfilePage.tsx', />Points</g, '>Points<');
forceReplace('frontend/src/components/ProfilePage.tsx', />Day Streak</g, '>Série de jours<');
forceReplace('frontend/src/components/ProfilePage.tsx', />Statistics</g, '>Statistiques<');
forceReplace('frontend/src/components/ProfilePage.tsx', />Challenges Completed</g, '>Défis terminés<');
forceReplace('frontend/src/components/ProfilePage.tsx', />Best Streak</g, '>Meilleure série<');
forceReplace('frontend/src/components/ProfilePage.tsx', />Achievements</g, '>Succès<');

forceReplace('frontend/src/components/ui/pagination.tsx', />Previous</g, '>Précédent<');
forceReplace('frontend/src/components/ui/pagination.tsx', />Next</g, '>Suivant<');
forceReplace('frontend/src/components/ui/pagination.tsx', />More pages</g, '>Plus de pages<');

console.log('Remaning translations applied');

