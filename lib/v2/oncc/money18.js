const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const sections = {
    exp: '新聞總覽',
    fov: '全日焦點',
    industry: '板塊新聞',
    int: '國際金融',
    recagent: '大行報告',
    ntlgroup: 'A股新聞',
    pro: '地產新聞',
    weainvest: '投資理財',
    ipo: '新股IPO',
    tech: '科技財情',
};

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'exp';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 30;

    const rootUrl = 'https://money18.on.cc';
    const currentUrl = `${rootUrl}/finnews/news_breaking.html?section=${id}`;
    const apiUrl = `${rootUrl}/cnt/utf8/content/20230210/articleList/list_${id}_all.js`;
    const ipoApiUrl = `https://dyn.on.cc/api/asrh/v1/events/names/新股/articles?page=1&limit=${limit}`;

    const response = await got({
        method: 'get',
        url: id === 'ipo' ? ipoApiUrl : apiUrl,
    });

    let items = [];

    if (id === 'ipo') {
        items = response.data.articles.slice(0, limit).map((item) => ({
            title: item.title,
            author: item.authorname,
            link: `${rootUrl}/finnews/content/${id}/${item.articleId}.html`,
            description: art(path.join(__dirname, 'templates/money18.art'), {
                images: item.hasHdPhoto ? [`https://hk.on.cc/hk/bkn${item.hdEnlargeThumbnail}`] : undefined,
                description: item.content,
            }),
            pubDate: timezone(parseDate(item.pubDate), +8),
        }));
    } else {
        items = response.data.slice(0, limit).map((item) => ({
            title: item.title,
            author: item.authorname,
            link: `${rootUrl}/finnews/content/${id}/${item.articleId}.html`,
            pubDate: timezone(parseDate(item.pubDate), +8),
        }));

        items = await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    item.description = art(path.join(__dirname, 'templates/money18.art'), {
                        images: content('.photo img')
                            .toArray()
                            .map((i) => content(i).attr('src')),
                        description: content('.content').html(),
                    });

                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title: `東網產經 - ${sections[id]}`,
        link: currentUrl,
        item: items,
    };
};
