const got = require('@/utils/got');
const entities = require('entities');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const response = await got.get(`https://wemp.app/accounts/${id}`);

    const $ = cheerio.load(response.data);
    const meta = $('.mp-info__list .mp-info__value');

    const author = $(meta[0]).text().trim();

    const year = new Date().getFullYear();
    const items = await Promise.all(
        $('.post-item__main')
            .get()
            .slice(0, 3)
            .map(async (e) => {
                let pubDate = date(`${year} ${$(e).find('.post-item__date').text().trim()}`, 8);

                if (new Date(pubDate) > new Date()) {
                    pubDate = new Date(pubDate).setFullYear(year - 1);
                    pubDate = new Date(pubDate).toUTCString();
                }

                const link = `https://wemp.app${$(e).find('.post-item__title').attr('href')}`;

                const response = await ctx.cache.tryGet(link, async () => (await got.get(link)).data);
                const article = cheerio.load(response);

                const matchs = /"(url|temp_url)":"([^"]+mp\.weixin\.qq\.com[^"]+)"/.exec(response);
                let weixinLink = '';
                if (matchs && matchs[2]) {
                    weixinLink = entities.decodeXML(unescape(matchs[2].replace(/\\u/g, '%u')));
                }

                const single = {
                    title: $(e).find('.post-item__title').text().trim(),
                    link: weixinLink || link,
                    description: article('#content').html(),
                    pubDate,
                    author,
                };

                return Promise.resolve(single);
            })
    );

    ctx.state.data = {
        title: `微信公众号 - ${author}`,
        link: `https://wemp.app/accounts/${id}/`,
        description: $(meta[1]).text().trim(),
        item: items,
    };
};
