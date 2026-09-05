const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const url = 'https://www.smetaengineeringservices.com/';
  const output = 'assets/images/portfolio-smeta.jpg';

  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log(`Waiting for 3 seconds for ${url}...`);
    await new Promise(r => setTimeout(r, 3000));
    console.log(`Taking screenshot for ${url}...`);
    await page.screenshot({ path: output, type: 'jpeg', quality: 90 });
    console.log(`Saved screenshot to ${output}`);
  } catch (e) {
    console.error(`Failed to screenshot ${url}:`, e);
  }

  await browser.close();
  console.log('Done.');
})();
