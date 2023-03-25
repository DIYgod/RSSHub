const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const column = ctx.params.column ?? 74;
    const currentUrl = `https://app.gzdaily.cn/app_if/getArticles?columnId=${column}&page=1`;

    const { data: response } = await got(currentUrl);

    const list = response.list
        .filter((i) => i.newstype === 0) // Remove special report (专题) and articles from Guangzhou Converged Media Center (新花城).
        .map((item) => ({
            title: item.title,
            description: art(path.join(__dirname, 'templates/description.art'), {
                thumb: item.picBig,
            }),
            pubDate: timezone(parseDate(item.publishtime), +8),
            link: item.shareUrl,
            colName: item.colName,
            author: item.arthorName,
        }));

    let colName = '';

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);
                colName = colName === '' ? item.colName : colName;
                if (content('.abstract').text()) {
                    content('.abstract').find('span').remove();
                    item.description += '<blockquote>' + content('.abstract').text() + '</blockquote>';
                }
                item.description += content('.article').html() ?? '';
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `广州日报客户端 - ${colName}`,
        link: `https://www.gzdaily.cn/amucsite/web/index.html#/home/${column}`,
        item: items,
    };
};
