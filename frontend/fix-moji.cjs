const fs = require('fs');
const path = require('path');
const replacements = {
  'Ã©': 'é',
  'Ã¨': 'è',
  'Ã ': 'à',
  'Ãª': 'ê',
  'Ã¢': 'â',
  'Ã´': 'ô',
  'Ã»': 'û',
  'Ã®': 'î',
  'Ã¯': 'ï',
  'Ã§': 'ç',
  'Â°': '°',
  'â‚¬': '€',
  'â€™': '\'',
  'Å“': 'œ',
  'â‚‚': '₂',
  'Ã‰': 'É',
  'Ã€': 'À',
  'ÃŠ': 'Ê'
};

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8');
      let old = c;
      
      for (const [bad, good] of Object.entries(replacements)) {
        c = c.split(bad).join(good);
      }
      c = c.replace(/Ã\xa0/g, 'à');
      c = c.replace(/Ã‚/g, ' ');
      
      if (c !== old) {
        fs.writeFileSync(p, c, 'utf8');
        console.log('Fixed', p);
      }
    }
  });
}
walk('src/components');
