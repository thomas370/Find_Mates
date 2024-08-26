const puppeteer = require('puppeteer');

async function getValorantRank(valorantName, valorantTag) {
    const url = `https://tracker.gg/valorant/profile/riot/${valorantName}%23${valorantTag}/overview`;

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--disable-dev-shm-usage',
                '--disable-extensions',
                '--disable-infobars',
                '--ignore-certificate-errors',
                '--enable-features=NetworkService',
                '--allow-running-insecure-content',
                '--disable-web-security',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ],
            defaultViewport: null,
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
        console.log(`Navigating to ${url}...`);

        // Attendre 5 secondes supplémentaires pour s'assurer que la page est complètement chargée
        setTimeout(() => {
            console.log('20 seconds have passed...');
        }, 20000);

        // Attendre que l'élément avec le sélecteur CSS spécifique soit présent
        const selector = 'div.rating-entry__rank-info div.value';
        await page.waitForSelector(selector, { timeout: 30000 });

        // Récupérer la valeur du rang
        const rankValue = await page.evaluate((selector) => {
            document.querySelector('*').style.transition = 'none';
            document.querySelector('*').style.animation = 'none';
            const element = document.querySelector(selector);
            return element ? element.textContent.trim() : null;
        }, selector);


        await browser.close();
        console.log(`Rank: ${rankValue}`);
        return rankValue || 'Rank not found';

    } catch (error) {
        console.error(`An error occurred: ${error}`);
        throw error;
    }
}

module.exports = getValorantRank;
