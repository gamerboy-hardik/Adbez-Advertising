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
      c = c.replace(/border-white\/\[[0-9.]+\]/g, 'border-border');
      c = c.replace(/border-white\/[0-9]+/g, 'border-border/50');
      c = c.replace(/bg-white\/\[[0-9.]+\]/g, 'bg-muted/50');
      c = c.replace(/hover:bg-white\/[0-9]+/g, 'hover:bg-muted');
      c = c.replace(/bg-white\/[0-9]+/g, 'bg-muted/50');
      c = c.replace(/bg-black\/[0-9]+/g, 'bg-muted/50');
      c = c.replace(/bg-\[#070b16\]/g, 'bg-muted/50');
      c = c.replace(/bg-\[#0d1426\]/g, 'bg-card');
      c = c.replace(/bg-\[#090f1d\]/g, 'bg-background');
      if (c !== o) {
        fs.writeFileSync(p, c, 'utf-8');
        console.log('Updated ' + p);
      }
    }
  });
}

walk('components');
walk('app');
