const cheerio = require('cheerio');

async function get_html(url) {
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('.promo-grid');
    const html = await page.content();
    await browser.close();

    return html;
    // Get title and link
}

async function get_elements(html, selector) {
    const elements = [];
    const $ = cheerio.load(html);
    $(selector).each((index, element) => {
        const text = $(element).text();
        const href = $(element).attr('href');
        elements.push({ title: text, link: href });
    });
    return elements;
}

module.exports = {
    get_html,
    get_elements,
};
