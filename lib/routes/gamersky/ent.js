const got = require('@/utils/got');
const cheerio = require('cheerio');

const map = new Map([
    ['qysj', { title: '趣囧时间', suffix: 'ent/qw' }],
    ['ymyy', { title: '游民影院', suffix: 'wenku/movie' }],
    ['ygtx', { title: '游观天下', suffix: 'ent/discovery' }],
    ['bztk', { title: '壁纸图库', suffix: 'ent/wp' }],
    ['ympd', { title: '游民盘点', suffix: 'wenku' }],
    ['ymfl', { title: '游民福利', suffix: 'ent/xz/' }],
]);

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const suffix = map.get(category).suffix;
    const title = map.get(category).title;

    const url = `https://www.gamersky.com/${suffix}`;
    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const list = $('ul.pictxt.contentpaging li')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('div.tit a').text(),
                link: $(this).find('div.tit a').attr('href'),
                pubDate: new Date($(this).find('.time').text()).toUTCString(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const itemUrl = info.link.startsWith('https://') ? info.link : `https://www.gamersky.com/${info.link}`;
            const pubDate = info.pubDate;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);

            let next_pages = $('div.page_css a')
                .map(function () {
                    return $(this).attr('href');
                })
                .get();

            next_pages = next_pages.slice(0, -1);

            const des = await Promise.all(
                next_pages.map(async (next_page) => {
                    const response = await got.get(next_page);
                    const $ = cheerio.load(response.data);
                    $('div.page_css').remove();

                    return $('.Mid2L_con').html().trim();
                })
            );

            const description = des.join('');

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: pubDate,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `游民娱乐-${title}`,
        link: url,
        item: out,
    };
};
