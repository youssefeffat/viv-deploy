const fs = require('fs');
let s = fs.readFileSync('src/styles/globals.css', 'utf8');
if (!s.includes('h1, h2, h3, h4, h5, h6 {')) {
  s += "\n@layer base {\n  h1, h2, h3, h4, h5, h6 { font-family: 'Museo Sans Rounded', sans-serif; }\n}\n";
  fs.writeFileSync('src/styles/globals.css', s);
  console.log('Appended to globals');
}
