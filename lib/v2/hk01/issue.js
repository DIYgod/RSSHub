const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got(`https://web-data.api.hk01.com/v2/page/issue/${id}`);
    const data = response.data;
    const list = data.issue.blocks[0].articles;

    await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(`https://www.hk01.com/${item.data.mainCategory}/${item.data.articleId}`, async () => {
                const detailResponse = await got(item.data.canonicalUrl);
                const $ = cheerio.load(detailResponse.data);

                $('div.lazyload-placeholder').remove();
                $('article > div.view-tracker').remove();
                $('article > div.flex.flex-col').remove();

                item.data.description = $('article').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `香港01 - ${data.issue.title}`,
        description: data.meta.metaDesc,
        link: data.issue.publishUrl,
        item: list.map((item) => ({
            title: item.data.title,
            author: item.data.authors && item.data.authors.map((e) => e.publishName).join(', '),
            description: `<img style="width: 100%" src="${item.data.mainImage.cdnUrl}" /><p>${item.data.description}</p>`,
            pubDate: parseDate(item.data.lastModifyTime * 1000),
            link: item.data.canonicalUrl,
        })),
    };
};
