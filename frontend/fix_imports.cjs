const fs = require('fs');
const path = require('path');
const dir = 'src/components/ui';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  // Match forms like 'lucide-react@0.487.0' or '@radix-ui/react-checkbox@1.1.4'
  // using regex without backslashes issues inside Powershell
  let newContent = content.replace(/from \"([a-z0-9\-]+)@[\d\.]+\"/gi, 'from "$1"');
  newContent = newContent.replace(/from \"(@[a-z0-9\-]+\/[a-z0-9\-]+)@[\d\.]+\"/gi, 'from "$1"');

  if (content !== newContent) {
    fs.writeFileSync(filePath, Buffer.from(newContent, 'utf8'));
    console.log('Fixed', file);
  }
}
