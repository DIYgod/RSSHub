const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const baseUrl = 'https://nautil.us';

module.exports = async (ctx) => {
    const categoryIdMap = await ctx.cache.tryGet('nautil:categories', async () => {
        const { data } = await got(`${baseUrl}/wp-json/wp/v2/categories`, {
            searchParams: {
                per_page: 100,
            },
        });
        return data.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
        }));
    });

    const { data: list } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            categories: categoryIdMap.find((item) => item.slug === ctx.params.tid.toLowerCase()).id,
            per_page: ctx.query.limit ? parseInt(ctx.query.limit) : 20,
        },
    });

    const out = list.map((item) => {
        const head = item.yoast_head_json;
        const $ = cheerio.load(item.content.rendered, null, false);
        // lazyload images
        $('img').each((_, e) => {
            e = $(e);
            e.attr('src', e.attr('data-src') ?? e.attr('srcset'));
            e.attr('src', e.attr('src').split('?')[0]);
            e.removeAttr('data-src');
            e.removeAttr('srcset');
        });
        return {
            title: item.title.rendered,
            author: item.yoast_head_json.author,
            description: art(path.join(__dirname, 'templates/description.art'), {
                head,
                rendered: $.html(),
            }),
            link: item.link,
            pubDate: parseDate(item.date_gmt),
        };
    });

    ctx.state.data = {
        title: 'Nautilus | ' + categoryIdMap.find((item) => item.slug === ctx.params.tid.toLowerCase()).name,
        link: `${baseUrl}/topics/${ctx.params.tid}/`,
        item: out,
    };
};
