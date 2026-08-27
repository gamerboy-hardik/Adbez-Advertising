const fs = require('fs');
const path = require('path');

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if(fs.statSync(p).isDirectory()) {
      walk(p);
    } else if(p.endsWith('.tsx') || p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf-8');
      let o = c;
      // Replace glass-panel with bg-card
      c = c.replace(/glass-panel /g, 'bg-card ');
      // Reduce heavy shadows
      c = c.replace(/shadow-2xl/g, 'shadow-md');
      c = c.replace(/shadow-xl/g, 'shadow-sm hover:shadow-md transition-shadow');
      if (c !== o) {
        fs.writeFileSync(p, c, 'utf-8');
        console.log('Updated ' + p);
      }
    }
  });
}

walk('components');
walk('app');
