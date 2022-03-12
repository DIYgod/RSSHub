const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const target_language = ctx.params.language;
    const target_section = ctx.params.section;

    var home_page = 'https://tass.com';
    switch (target_language) {
        case 'ru':
            home_page = 'https://tass.ru';
            break;
        case 'en':
            home_page = 'https://tass.com';
            break;
    }
    const url_link = `${home_page}/rss/v2.xml`

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
        link: home_page,
        description: 'TASS News Agency',
        language: target_language,
        image: `${home_page}/favicon.ico`,
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

                if (target_section == 'all' || link.startsWith(`${home_page}/${target_section}/`)){
                    return {
                        title,
                        category,
                        description,
                        pubDate,
                        link,
                        enclosure_url,
                        enclosure_type,
                        enclosure_length
                    };
                } else {
                    return [];
                }
            })
            .get(),
    };
};
