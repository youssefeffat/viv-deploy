
const fs = require('fs');

function forceReplace(file, search, replace) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(search, replace);
    fs.writeFileSync(file, content, 'utf8');
}

forceReplace('frontend/src/components/ui/dialog.tsx', />Close</g, '>Fermer<');
forceReplace('frontend/src/components/ui/sheet.tsx', />Close</g, '>Fermer<');
forceReplace('frontend/src/components/ui/sidebar.tsx', />Sidebar</g, '>Barre latérale<');
forceReplace('frontend/src/components/ui/sidebar.tsx', />Displays the mobile sidebar.</g, '>Affiche la barre latérale mobile.<');
forceReplace('frontend/src/components/ui/sidebar.tsx', />Toggle Sidebar</g, '>Basculer la barre latérale<');
forceReplace('frontend/src/components/ui/carousel.tsx', />Previous slide</g, '>Diapositive précédente<');
forceReplace('frontend/src/components/ui/carousel.tsx', />Next slide</g, '>Diapositive suivante<');

