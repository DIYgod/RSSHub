const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'https://www.cbndata.com';
    const apiUrl = `${rootUrl}/api/v3/informations?page=1&per_page=10${category ? `&tag_id=${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.data.map((item) => ({
        title: item.id,
        link: `${rootUrl}/api/v3/informations/show?id=${item.id}`,
        pubDate: Date.parse(item.date),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                item.link = `${rootUrl}/information/${item.title}`;

                item.title = detailResponse.data.data.title;
                item.author = detailResponse.data.data.author;
                item.description = detailResponse.data.data.content;

                return item;
            })
        )
    );

    let title = '看点';

    for (const tag of response.data.home_tags) {
        if (tag.id.toString() === category) {
            title = tag.name;
            break;
        }
    }
    ctx.state.data = {
        title: `${title} - CBNData消费站`,
        link: `${rootUrl}/information${category ? `?tag_id=${category}` : ''}`,
        item: items,
    };
};
