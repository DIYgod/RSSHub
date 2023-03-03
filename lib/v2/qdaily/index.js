const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const baseUrl = 'http://www.qdaily.com';
    const { type, id } = ctx.params;

    const typeMap = {
        tag: {
            type: 'tags',
            apiPath: 'tags/tagmore',
            apiSuffix: '.json',
        },
        category: {
            type: 'categories',
            apiPath: 'categories/categorymore',
            apiSuffix: '.json',
        },
        column: {
            type: 'special_columns',
            apiPath: 'special_columns/show_more',
            apiSuffix: '',
        },
    };

    const url = `${baseUrl}/${typeMap[type].type}/${id}.html`;

    const res = await got(url);
    const $ = cheerio.load(res.data);
    const lastKey = $('.packery-container').attr('data-lastkey');

    const { data } = await got(`${baseUrl}/${typeMap[type].apiPath}/${id}/${lastKey}${typeMap[type].apiSuffix}`);

    const list = data.data.feeds.map((item) => ({
        title: item.post.title,
        description: item.post.description,
        pubDate: parseDate(item.post.publish_time),
        link: `${baseUrl}/articles/${item.post.id}.html`,
        category: item.post.category.title,
        image: item.image,
    }));

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got(item.link);
                const $ = cheerio.load(res.data);

                $('.author-share, .embed-mask, .lazylad, .lazyloa, .lazylod, .lazylaad, .lazylood,  .lazyloadd').remove();
                $('.article-detail-bd')
                    .find('img')
                    .each((_, img) => {
                        if (img.attribs['data-src']) {
                            img.attribs.src = img.attribs['data-src'].split('-w600')[0];
                            delete img.attribs['data-src'];
                        }
                    });

                item.description = art(path.join(__dirname, 'templates/article.art'), {
                    image: item.image.split('?')[0],
                    description: $('.article-detail-bd').html(),
                });
                item.category = [
                    ...new Set([
                        item.category,
                        ...$('.tags .tag a')
                            .toArray()
                            .map((item) => $(item).text()),
                    ]),
                ];

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: 'http://www.qdaily.com/favicon.ico',
        link: url,
        item: out,
    };
};
