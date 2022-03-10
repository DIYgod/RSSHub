const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const target_lang = ctx.params.lang;
    const target_category = ctx.params.category;

    var url_link = `https://tass.ru/${target_lang}/rss/v2.xml`;
    if (target_lang=='ru'){
        url_link = `https://tass.ru/rss/v2.xml`;
    }

    const xml = await ctx.cache.tryGet(url_link, async () => {
        const browser = await require('@/utils/puppeteer')();
        const page = await browser.newPage();
        await page.goto(url_link);
        await page.waitForNavigation();
        const xml = await page.evaluate(() => document.documentElement.innerHTML);
        browser.close();
        return xml;
    });

    const $ = cheerio.load(xml, {xmlMode: true});

    const list = $('item');

    ctx.state.data = {
        title: 'TASS',
        link: 'https://tass.ru',
        description: 'TASS News Agency',
        language: target_lang,
        image: 'https://tass.com/i/rss/en/logo.png',
        item: list
            .map((index, item) => {
                item = $(item);
                const title = item.find('title').text();
                const pubDate = item.find('pubDate').text();
                const link = item.find('guid').text();
                const description = item.find('description').text();
                const enclosure_url = item.find('enclosure').attr('url');
                const enclosure_type = item.find('enclosure').attr('type');
                const enclosure_length = item.find('enclosure').attr('length');
                const category = item.find('category').map((index, e) => $(e).text()).get();

                const to_return = {
                    title,
                    category,
                    description,
                    pubDate,
                    link,
                    enclosure_url,
                    enclosure_type,
                    enclosure_length
                };
                if (target_category == 'all' || link.startsWith('https://tass.com/'+target_category+'/')){
                    return to_return;
                } else {
                    return [];
                }
            })
            .get(),
    };
};
