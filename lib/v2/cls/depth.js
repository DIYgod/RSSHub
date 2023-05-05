const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const { rootUrl, getSearchParams } = require('./utils');

const categories = {
    1000: '头条',
    1003: '股市',
    1135: '港股',
    1007: '环球',
    1005: '公司',
    1118: '券商',
    1110: '基金',
    1006: '地产',
    1032: '金融',
    1119: '汽车',
    1111: '科创',
    1127: '创业版',
    1160: '品见',
    1124: '期货',
    1176: '投教',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '1000';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;

    const title = categories[category];

    if (!title) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/finance.html#cai-lian-she-shen-du">docs</a>');
    }

    const apiUrl = `${rootUrl}/v3/depth/home/assembled/${category}`;
    const currentUrl = `${rootUrl}/depth?id=${category}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
        searchParams: getSearchParams(),
    });

    let items = response.data.data.top_article
        .concat(response.data.data.depth_list)
        .slice(0, limit)
        .map((item) => ({
            title: item.title || item.brief,
            link: `${rootUrl}/detail/${item.id}`,
            pubDate: parseDate(item.ctime * 1000),
            author: item.source,
        }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                const nextData = JSON.parse(content('script#__NEXT_DATA__').text());
                const articleDetail = nextData.props.initialState.detail.articleDetail;

                item.author = articleDetail.author?.name ?? item.author ?? '';
                item.description = art(path.join(__dirname, 'templates/depth.art'), {
                    articleDetail,
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `财联社 - ${title}`,
        link: currentUrl,
        item: items,
    };
};
