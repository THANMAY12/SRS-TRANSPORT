const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src/pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let idCounter = 1;
  content = content.replace(/<label([^>]*)>(.*?)<\/label>\s*<(input|select)([^>]*?)>/gs, (match, labelAttrs, labelContent, tag, inputAttrs) => {
    const id = `field_${file.replace('.jsx', '')}_${idCounter++}`;
    return `<label htmlFor="${id}"${labelAttrs}>${labelContent}</label>\n                <${tag} id="${id}"${inputAttrs}>`;
  });
  fs.writeFileSync(path.join(dir, file), content);
});

console.log('Fixed labels');
