const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';

    const rootUrl = 'https://panewslab.com';
    const apiUrl = `${rootUrl}/api/newstopic/page`;
    const currentUrl = `${rootUrl}/zh/profundity/index.html`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        form: {
            language: 'zh',
            pageIndex: 1,
            pageSize: 25,
            newsTopicState: 'PUBLISHED',
            isEssence: 'T',
            tags: category,
        },
    });

    let items = response.data.data.list.map((item) => ({
        title: item.title,
        author: item.nick_name,
        pubDate: parseDate(item.create_time),
        link: `${rootUrl}/zh/articledetails/${item.id}.html`,
        description: `<blockquote>${item.remark}</blockquote>`,
        category: item.tags.split(','),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description += content('#txtinfo').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `PANews - ${category || '精选'}`,
        link: currentUrl,
        item: items,
    };
};
