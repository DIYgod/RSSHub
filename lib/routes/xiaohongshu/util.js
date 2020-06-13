const delay = (timeout = 1000) => new Promise((resolve) => setTimeout(resolve, timeout));

async function getContent(url) {
    const browser = await require('@/utils/puppeteer')();
    try {
        const page = await browser.newPage();
        await page.goto(url);
        await delay(1000);
        const content = await page.content();
        return content.replace('"RedAppLayout":undefined,', ''); // fix json parse
    } finally {
        browser.close();
    }
}

module.exports = {
    getContent,
};
