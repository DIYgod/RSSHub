const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const columnId = ctx.params.column ?? 38;
    const currentUrl = `https://api.nfapp.southcn.com/nfplus-manuscript-web/article/list?columnId=${columnId}&nfhSubCount=1&pageNum=1&pageSize=20`;

    const { data: response } = await got(currentUrl);

    const list = response.data.list
        .filter((i) => i.articleType === 0)
        .map((item) => ({
            title: item.title,
            description: art(path.join(__dirname, '../templates/description.art'), {
                thumb: item.picMiddle,
                description: item.summary === '详见内文' ? '' : item.summary,
            }),
            pubDate: timezone(parseDate(item.updateTime), +8),
            link: `http://pc.nfapp.southcn.com/${item.columnId}/${item.articleId}.html`,
            articleId: item.articleId,
            columnId: item.columnId,
            columnName: item.columnName,
        }));

    let columnName = '';

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = cheerio.load(detailResponse.data);

                $('.article-nfh-icon, .article-crumb, .article-share, .article-copyright').remove();

                item.description += $('#content').html() ?? '';
                item.author = $('meta[name="author"]').attr('content');

                if (columnName === '') {
                    columnName = item.columnId === columnId ? item.columnName : '';
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `南方+ - ${columnName}`,
        link: `https://m.nfapp.southcn.com/${columnId}`,
        item: items,
    };
};
