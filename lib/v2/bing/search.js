const parser = require('@/utils/rss-parser');
module.exports = async (ctx) => {
    const q = ctx.params.keyword;
    const searchParams = new URLSearchParams({
        format: 'rss',
        q,
    });
    const url = new URL('https://cn.bing.com/search');
    url.search = searchParams.toString();
    const data = await parser.parseURL(url.toString());
    ctx.state.data = {
        title: data.title,
        link: data.link,
        description: data.description + ' - ' + data.copyright,
        image: data.image.url,
        item: data.items.map((e) => ({
            ...e,
            description: e.content,
        })),
    };
};
