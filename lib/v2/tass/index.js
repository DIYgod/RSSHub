const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const target_language = ctx.params.language;
    const target_section = ctx.params.section;

    var url_link = `https://tass.ru/${target_language}/rss/v2.xml`;
    if (target_language=='ru'){
        url_link = `https://tass.ru/rss/v2.xml`;
    }
    if (target_language=='en'){
        url_link = `https://tass.com/rss/v2.xml`;
    }

    const xml = await ctx.cache.tryGet(
        url_link, 
        async () => {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.goto(url_link);
            // await page.waitForNavigation();
            const xml = await page.evaluate(() => document.documentElement.innerHTML);
            browser.close();
            return xml;
        },
        15*60
    );

    const $ = cheerio.load(xml, {xmlMode: true});

    const list = $('item');

    ctx.state.data = {
        title: target_section == 'all' ? 'TASS' : `TASS: ${target_section}`,
        link: 'https://tass.com',
        description: 'TASS News Agency',
        language: target_language,
        image: 'https://tass.com/favicon.ico',
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
                if (target_section == 'all' || link.startsWith('https://tass.com/'+target_section+'/')){
                    return to_return;
                } else {
                    return [];
                }
            })
            .get(),
    };
};
