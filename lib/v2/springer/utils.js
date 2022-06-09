async function getHtml(url) {
    const browser = await require('@/utils/puppeteer')();
    try {
        const page = await browser.newPage();
        await page.goto(url);
        const html = await page.evaluate(() => document.querySelector('*').innerHTML);
        return html;
    } finally {
        browser.close();
    }
}

module.exports = {
    getHtml,
};
