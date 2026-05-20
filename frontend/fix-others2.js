
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

replaceInFile('QuizPage.tsx', {
    '>Quiz sur l\\'Ã©cologie<': '>Quiz sur l\\'écologie<',
    '>Loading...<': '>Chargement...<'
});

replaceInFile('ResultPage.tsx', {
    '>Excellent work\\!<': '>Excellent travail !<',
    '>Good effort\\!<': '>Bon travail !<',
    '>Keep learning\\!<': '>Continuez à apprendre !<',
    '>You\\'ve mastered these eco-concepts.<': '>Vous maîtrisez ces concepts écologiques.<',
    '>You\\'re on your way to becoming an eco-expert.<': '>Vous êtes sur la bonne voie pour devenir un éco-expert.<',
    '>Every step counts towards a greener future.<': '>Chaque étape compte vers un avenir plus vert.<',
    '>Back to Dashboard<': '>Retour au tableau de bord<'
});

