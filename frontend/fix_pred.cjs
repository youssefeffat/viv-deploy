const fs = require('fs');
let content = fs.readFileSync('src/components/PredictionPage.tsx', 'utf8');

// Undo bad global replace
content = content.replace(/h2 className="text-3xl md:text-4xl mb-4" style={{ color: "white" }}/g, 'h2 className="text-3xl md:text-4xl mb-4" style={{ color: "var(--viv-navy)" }}');
content = content.replace(/h3 className="text-xl mb-2" style={{ color: "white" }}/g, 'h3 className="text-xl mb-2" style={{ color: "var(--viv-navy)" }}');

fs.writeFileSync('src/components/PredictionPage.tsx', content);
console.log('Fixed');
