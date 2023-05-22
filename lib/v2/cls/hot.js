const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const { rootUrl, getSearchParams } = require('./utils');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;

    const apiUrl = `${rootUrl}/v2/article/hot/list`;

    const response = await got({
        method: 'get',
        url: apiUrl,
        searchParams: getSearchParams(),
    });

    let items = response.data.data.slice(0, limit).map((item) => ({
        title: item.title || item.brief,
        link: `${rootUrl}/detail/${item.id}`,
        pubDate: parseDate(item.ctime * 1000),
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
        title: '财联社 - 热门文章排行榜',
        link: rootUrl,
        item: items,
    };
};
