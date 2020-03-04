const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let loadedImg = false;
    let html = null;

    await (async () => {
        try {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await Promise.race([page.goto('https://www.producthunt.com/'), page.waitFor('body')]);
            html = await page.content();
            // eslint-disable-next-line no-undef
            await page.waitFor(() => !!document.querySelector('ul[class^="postsList"] li [data-test="post-thumbnail"] img'));
            html = await page.content();
            loadedImg = true;
            browser.close();
        } catch (e) {
            return;
        }
    })();

    const $ = cheerio.load(html);

    const list = $('ul[class^="postsList"] li');
    ctx.state.data = {
        title: 'Product Hunt Today Popular',
        link: 'https://www.producthunt.com/',
        item: list
            .map((i, item) => {
                const itemDom = $(item);
                const descImgSrc = loadedImg && itemDom.find('[data-test="post-thumbnail"] img').attr('src');
                return {
                    title: itemDom.find('h3').text(),
                    description: `${itemDom.find('h3 + p').text()}` + (descImgSrc ? `<br><img src="${descImgSrc}">` : ''),
                    link: 'https://www.producthunt.com' + itemDom.find('a').attr('href'),
                };
            })
            .get(),
    };
};
