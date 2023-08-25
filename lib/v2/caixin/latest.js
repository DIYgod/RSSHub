const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { data } = await got('https://gateway.caixin.com/api/dataplatform/scroll/index').json();

    const list = data.articleList
        .map((e) => ({
            title: e.title,
            link: e.url,
            pubDate: e.time,
            category: e.channelObject.name,
        }))
        .filter((item) => !item.link.startsWith('https://fm.caixin.com/') && !item.link.startsWith('https://video.caixin.com/') && !item.link.startsWith('https://datanews.caixin.com/')); // content filter

    const rss = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(`caixin:latest:${item.link}`, async () => {
                const entry_r = await got(item.link);
                const $ = cheerio.load(entry_r.data);

                // desc
                const desc = art(path.join(__dirname, 'templates/article.art'), {
                    item,
                    $,
                });

                item.description = desc;
                // prevent cache coliision with /caixin/article and /caixin/:column/:category
                // since those have podcasts
                item.guid = `caixin:latest:${item.link}`;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '财新网 - 最新文章',
        link: 'https://www.caixin.com/',
        item: rss,
    };
};
