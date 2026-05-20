
const fs = require('fs');
const path = require('path');
const file = path.join('frontend', 'src', 'components', 'CommunityPage.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/'Community'/g, \'Communauté'\);
content = content.replace(/>Community</g, \>Communauté<\);
content = content.replace(/>Join the global effort</g, \>Rejoignez l'effort mondial<\);
content = content.replace(/>Friends</g, \>Amis<\);
content = content.replace(/>Leaderboard</g, \>Classement<\);
content = content.replace(/Search friends.../g, \Chercher des amis...\);
content = content.replace(/>Find Friends</g, \>Trouver des amis<\);
content = content.replace(/>Global Ranking</g, \>Classement mondial<\);
content = content.replace(/>Connect</g, \>Se connecter<\);
content = content.replace(/>Trees</g, \>Arbres<\);
content = content.replace(/Day Streak/g, \Jours d'affilée\);
content = content.replace(/>PTS</g, \>PTS<\);
content = content.replace(/>Top 1%</g, \>Top 1%<\);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed CommunityPage.tsx');

