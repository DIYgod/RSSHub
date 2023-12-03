const cheerio = require('cheerio');
const got = require('@/utils/got');
const logger = require('@/utils/logger');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.modb.pro';
    const topicId = ctx.params.id;
    const response = await got({
        url: `${baseUrl}/api/columns/getKnowledge`,
        searchParams: {
            pageNum: 1,
            pageSize: 20,
            columnId: topicId,
        },
    }).json();
    const list = response.list.map((item) => {
        let doc = {};
        let baseLink = {};
        switch (item.type) {
            case 0:
                doc = item.knowledge;
                baseLink = `${baseUrl}/db`;
                break;
            case 1:
                doc = item.dbDoc;
                baseLink = `${baseUrl}/doc`;
                break;
            default:
                logger.error(`unknown type ${item.type}`);
        }

        return {
            title: doc.title,
            link: `${baseLink}/${item.rid}`,
            pubDate: timezone(parseDate(item.createdTime), +8),
            author: doc.createdByName,
            category: doc.tags,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                item.description = $('div.editor-content-styl.article-style').first().html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '墨天轮合辑',
        link: `${baseUrl}/topic/${topicId}`,
        item: items,
    };
};
