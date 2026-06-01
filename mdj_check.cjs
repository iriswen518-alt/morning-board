const { chromium } = require('playwright');
(async () => {
  const codes = ['EB09999','EB18888'];
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  for (const code of codes) {
    try {
      await p.goto(`https://www.moneydj.com/iquote/iQuoteChart.djhtm?a=${code}`, { waitUntil:'networkidle', timeout:30000 });
      await p.waitForTimeout(2000);
      const title = await p.title();
      const txt = await p.evaluate(() => {
        const out=[];
        document.querySelectorAll('h1,h2,h3,td,span,a,b,strong').forEach(e=>{
          const t=(e.textContent||'').trim();
          if(/加權|櫃買|上櫃|電子|金融|指數/.test(t)&&t.length<16) out.push(t);
        });
        return [...new Set(out)].slice(0,10);
      });
      console.log(code,'| title:',JSON.stringify(title),'| match:',JSON.stringify(txt));
    } catch(e){ console.log(code,'ERR',e.message); }
  }
  await b.close();
})();
