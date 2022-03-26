const got = require('@/utils/got');
const cheerio = require('cheerio');

const base = 'https://sites.google.com/';

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const init_url = `https://sites.google.com/site/${id}/system/app/pages/sitemap/list?offset=0`;
    const init_response = await got.get(init_url);

    const test_pages_count = init_response.data.match(/'sites-pagination-next-link-top', (\d+),/);
    if (!test_pages_count) {
        throw 'Site Not Found';
    }
    const pages_count = parseInt(test_pages_count[1]);

    const url = pages_count > 20 ? `https://sites.google.com/site/${id}/system/app/pages/sitemap/list?offset=${pages_count - 20}` : init_url;
    const response = url === init_url ? init_response : await got.get(url);

    const $ = cheerio.load(response.data);

    const site_name = $('a#sites-chrome-userheader-title').text();
    const list = $('.sites-table > tbody > tr').get();

    const parseContent = (htmlString) => {
        const $ = cheerio.load(htmlString);

        const content = $('#sites-canvas-main-content');

        return {
            description: content.html(),
        };
    };

    const out = await Promise.all(
        list.map(async (item, index) => {
            const $ = cheerio.load(item);

            const title = $('a');
            const path = title.attr('href');
            const link = base + path;
            const time = new Date();
            time.setMinutes(time.getMinutes() - pages_count + index);

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const rssitem = {
                title: title.text().trim(),
                link,
                pubDate: time,
                author: site_name,
            };

            try {
                const response = await got.get(link);
                const result = parseContent(response.data);
                rssitem.description = result.description;
            } catch (err) {
                return Promise.resolve('');
            }
            ctx.cache.set(link, JSON.stringify(rssitem));
            return Promise.resolve(rssitem);
        })
    );

    ctx.state.data = {
        title: `${site_name} - Google Sites`,
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
