const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '86410';
    const tag = ctx.params.tag ?? '';

    const rootUrl = 'https://cloud.tencent.com';
    const currentUrl = `${rootUrl}/developer/column/${id}${tag ? `/tag-${tag}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = JSON.parse(response.data.match(/window\.\$render\((.*?)\);/)[1]);

    let items = data.articleData.list.map((item) => ({
        title: item.title,
        author: item.author.name,
        link: `${rootUrl}/developer/article/${item.id}`,
        pubDate: parseDate(item.updateTime * 1000),
        category: item.tags.map((tag) => tag.name),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('.developer-code-block').remove();

                item.description = content('.rno-markdown').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${data.columnDetail.name} - ${data.documentBaseTitle}`,
        link: currentUrl,
        item: items,
    };
};
