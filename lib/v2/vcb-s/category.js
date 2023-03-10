const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://vcb-s.com';
const cateAPIUrl = `${rootUrl}/wp-json/wp/v2/categories`;
const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;

module.exports = async (ctx) => {
    const cat = ctx.params.cat;
    const limit = ctx.params.limit ?? 7;
    const cateLink = `${cateAPIUrl}?slug=${cat}`;
    const category = await ctx.cache.tryGet(cateLink, async () => {
        const res = await got({
            method: 'get',
            url: cateLink,
        });

        if (typeof res.data === 'string') {
            res.data = JSON.parse(res.body.trim());
        }
        return res.data[0];
    });

    const response = await got.get(`${postsAPIUrl}?categories=${category.id}&page=1&per_page=${limit}&_embed`);
    if (typeof response.data === 'string') {
        response.data = JSON.parse(response.body.trim());
    }
    const data = response.data;

    const items = data.map((item) => {
        let description = item.content.rendered
            .replace(/<div.+?abh_box[\w\W]+/g, '')
            .replace(/<p.+?medie-info-switch[\w\W]+/g, '')
            .replace(/<div.+?dw-box-download.+?>([\w\W]+?)<\/div>/g, '<pre>$1</pre>');

        if (item._embedded['wp:featuredmedia'] && item._embedded['wp:featuredmedia'].length > 0) {
            const media = item._embedded['wp:featuredmedia'][0];
            description = `<figure class="thumbnail"><img width="${media.media_details.width}" height="${media.media_details.height}" src="${media.source_url}"></figure>${description}`;
        }

        return {
            title: item.title.rendered,
            link: item.link,
            description,
            pubDate: parseDate(item.date),
            author: item._embedded.author[0].name,
        };
    });

    ctx.state.data = {
        title: `${category.name} | VCB-Studio`,
        link: `${rootUrl}/archives/category/${category.slug}`,
        item: items,
    };
};
