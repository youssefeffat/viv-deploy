const fs = require('fs');
let s = fs.readFileSync('src/styles/globals.css', 'utf8');
s = s.replace(/\\'Museo Sans Rounded\\'/g, "'Museo Sans Rounded'");
fs.writeFileSync('src/styles/globals.css', s);
