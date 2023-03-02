const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { rootUrl } = require('./utils');

const titles = {
    280: '最新',
    333: '新品',
    331: 'DeFi',
    334: 'NFT',
    332: '存储',
    330: '波卡',
    297: '行情',
    296: '活动',
};

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '280';

    const currentUrl = `${rootUrl}/api/pp/api/app-front/feed-stream?feed_id=${id}&b_id=&per_page=${ctx.query.limit ?? 25}`;

    const response = await got(currentUrl);

    let items = response.data.data.items
        .map((item) => ({
            title: item.title,
            type: item.entity_type,
            description: `<p>${item.summary}</p>`,
            link: `${rootUrl}/${item.entity_type}/${item.entity_id}`,
            pubDate: timezone(parseDate(item.published_at), +8),
        }))
        .filter((item) => item.type !== 'newsflash');

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const ssr = JSON.parse(`{${detailResponse.data.match(/window\.__INITIAL_STATE__ = {(.*)}/)[1]}}`);

                const content = cheerio.load(ssr.post.detail.content, null, false);
                content('img').each((_, img) => {
                    img.attribs.src = img.attribs.src.split('?x-oss-process')[0];
                    img.attribs.src = img.attribs.src.split('!heading')[0];
                });

                item.description = content.html();
                item.author = ssr.post.user.name;

                delete item.type;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${titles[id]} - Odaily星球日报`,
        link: rootUrl,
        item: items,
    };
};
