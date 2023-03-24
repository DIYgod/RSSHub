const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const reporterId = ctx.params.reporter;
    const currentUrl = `https://api.nfapp.southcn.com/nanfang_if/reporter/list?reporterUuid=${reporterId}&pageSize=20&pageNo=1&origin=0`;

    const { data: response } = await got(currentUrl);

    const list = response.data.reportInfo.articleInfo.map((item) => ({
        title: item.title,
        description: art(path.join(__dirname, '../templates/description.art'), {
            thumb: item.picMiddle,
            description: item.attAbstract,
        }),
        pubDate: timezone(parseDate(item.publishtime), +8),
        link: `http://pc.nfapp.southcn.com/${item.colID}/${item.fileId}.html`,
        articleId: item.fileId,
    }));

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

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `南方+ - ${response.data.reportInfo.reporterName}`,
        link: `https://static.nfapp.southcn.com/apptpl/reporterWorksList/index.html?reporterUuid=${response.data.reportInfo.reporterUuid}`,
        item: items,
    };
};
