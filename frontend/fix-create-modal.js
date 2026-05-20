
const fs = require('fs');
const path = require('path');

const file = path.join('frontend', 'src', 'components', 'CreateChallengeModal.tsx');
let content = fs.readFileSync(file, 'utf8');

// Fix accidental encoding issues
content = content.replace(/Ã‰nergie/g, 'Énergie');
content = content.replace(/Create New Challenge/g, 'Créer un nouveau défi');
content = content.replace(/Challenge Title/g, 'Titre du défi');
content = content.replace(/Enter a descriptive title/g, 'Entrez un titre descriptif');
content = content.replace(/Category/g, 'Catégorie');
content = content.replace(/Points Reward/g, 'Récompense en points');
content = content.replace(/Cancel/g, 'Annuler');
content = content.replace(/'Create Challenge'/g, 'Créer le défi');
content = content.replace(/>Create Challenge</g, '>Créer le défi<');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed CreateChallengeModal.tsx');

