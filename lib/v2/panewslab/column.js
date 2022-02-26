const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://panewslab.com';
    const apiUrl = `${rootUrl}/api/newstopic/page`;
    const currentUrl = `${rootUrl}/zh/author/${id}.html`;

    let author = '';

    const response = await got({
        method: 'post',
        url: apiUrl,
        form: {
            memberId: id,
            language: 'zh',
            pageIndex: 1,
            pageSize: 25,
            newsTopicState: 'PUBLISHED',
        },
    });

    let items = response.data.data.list.map((item) => {
        author = item.nick_name;
        return {
            author,
            title: item.title,
            pubDate: parseDate(item.create_time),
            link: `${rootUrl}/zh/articledetails/${item.id}.html`,
            description: `<blockquote>${item.remark}</blockquote>`,
            category: item.tags.split(','),
        };
    });

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
        title: `PANews - ${author}`,
        link: currentUrl,
        item: items,
    };
};
