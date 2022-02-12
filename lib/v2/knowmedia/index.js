const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://www.knowmedia.tw';

const cateMap = {
    jqgx: '近期更新',
    jxzl: '精選專欄',
    hdxx: '活動訊息',
    yyzq: '影音專區',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'zxxx';
    const cateContentAPI = `${rootUrl}/_next/data/R4NWLZhyr9OwccR99jOwm/topics/${cateMap[category]}.json`;

    const response = await got.get(cateContentAPI);
    const data = response.data.pageProps.data.articles;

    const items = data.map((item) => ({
        title: item.meta_title,
        author: item.author.name,
        description: art(path.join(__dirname, 'templates/desc.art'), {
            imgUrl: item.cover.thumb_url,
            body: item.body,
        }),
        pubDate: parseDate(item.published_at),
        link: item.frontend_url,
    }));

    ctx.state.data = {
        title: `識媒體 - ${cateMap[category]}`,
        link: `${rootUrl}/topics/${category}`,
        item: items,
    };
};
