const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const newFontFaces = \
@font-face {
  font-family: 'Museo Sans';
  src: url('./Pack_charte_graphique/Typographie/fonts/fonnts.com-Museo_Sans_100.otf') format('opentype');
  font-weight: 100;
  font-style: normal;
}
@font-face {
  font-family: 'Museo Sans';
  src: url('./Pack_charte_graphique/Typographie/fonts/fonnts.com-Museo_Sans_300.otf') format('opentype');
  font-weight: 300;
  font-style: normal;
}
@font-face {
  font-family: 'Museo Sans';
  src: url('./Pack_charte_graphique/Typographie/fonts/fonnts.com-Museo_Sans_500.otf') format('opentype');
  font-weight: 500;
  font-style: normal;
}
@font-face {
  font-family: 'Museo Sans';
  src: url('./Pack_charte_graphique/Typographie/fonts/fonnts.com-Museo_Sans_700.otf') format('opentype');
  font-weight: 700;
  font-style: normal;
}
@font-face {
  font-family: 'Museo Sans';
  src: url('./Pack_charte_graphique/Typographie/fonts/fonnts.com-Museo_Sans_900.otf') format('opentype');
  font-weight: 900;
  font-style: normal;
}

@font-face {
  font-family: 'Museo Sans Rounded';
  src: url('./Pack_charte_graphique/Typographie/fonts/fonnts.com-Museo_Sans_Rounded_300.otf') format('opentype');
  font-weight: 300;
  font-style: normal;
}
@font-face {
  font-family: 'Museo Sans Rounded';
  src: url('./Pack_charte_graphique/Typographie/fonts/fonnts.com-Museo_Sans_Rounded_500.otf') format('opentype');
  font-weight: 500;
  font-style: normal;
}
@font-face {
  font-family: 'Museo Sans Rounded';
  src: url('./Pack_charte_graphique/Typographie/fonts/fonnts.com-Museo_Sans_Rounded_700.otf') format('opentype');
  font-weight: 700;
  font-style: normal;
}
@font-face {
  font-family: 'Museo Sans Rounded';
  src: url('./Pack_charte_graphique/Typographie/fonts/fonnts.com-Museo_Sans_Rounded_900.otf') format('opentype');
  font-weight: 900;
  font-style: normal;
}
\;

css = css.replace(/@font-face\s*\{[\s\S]*?\}\s*(?=@font-face|@theme)/g, '');
css = css.replace('@theme', newFontFaces + '\n@theme');

fs.writeFileSync('src/index.css', css);
console.log('Fixed index.css');

let globalsInfo = fs.readFileSync('src/styles/globals.css', 'utf8');
if (!globalsInfo.includes('Museo Sans Rounded')) {
    globalsInfo = globalsInfo.replace(/h1\s*\{/g, 'h1 { font-family: \\'Museo Sans Rounded\\', sans-serif;');
    globalsInfo = globalsInfo.replace(/h2\s*\{/g, 'h2 { font-family: \\'Museo Sans Rounded\\', sans-serif;');
    globalsInfo = globalsInfo.replace(/h3\s*\{/g, 'h3 { font-family: \\'Museo Sans Rounded\\', sans-serif;');
    globalsInfo = globalsInfo.replace(/h4\s*\{/g, 'h4 { font-family: \\'Museo Sans Rounded\\', sans-serif;');
    fs.writeFileSync('src/styles/globals.css', globalsInfo);
    console.log('Fixed globals.css');
}

