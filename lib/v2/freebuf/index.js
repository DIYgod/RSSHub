const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { type = 'web' } = ctx.params;

    const fapi = 'https://www.freebuf.com/fapi/frontend/category/list';
    const baseUrl = 'https://www.freebuf.com';
    const rssLink = `${baseUrl}/articles/${type}`;

    const options = {
        headers: {
            referer: 'https://www.freebuf.com',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        },
        searchParams: {
            name: type,
            page: 1,
            limit: 20,
            select: 0,
            order: 0,
            type: 'category',
        },
    };

    const response = await got.get(fapi, options).json();

    const items = response.data.data_list.map((item) => ({
        title: item.post_title,
        link: `${baseUrl}${item.url}`,
        description: item.content,
        pubDate: parseDate(item.post_date),
        author: item.nickname,
    }));

    ctx.state.data = {
        title: `Freebuf ${type}`,
        link: rssLink,
        item: items,
    };
};
