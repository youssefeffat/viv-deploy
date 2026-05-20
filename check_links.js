const d = require('fs').readdirSync('frontend/src/components', {recursive:true});
for (const f of d) {
    if (!f.endsWith('.tsx')) continue;
    let t = require('fs').readFileSync('frontend/src/components/'+f, 'utf8');
    const regex = /(to|href|navigate|path)[:=[\(]\s*[\"']([^\"t']+)[\"']/g;
    const links = t.match(regex);
    if(links) console.log(f + ': ' + links.join(', '));
}