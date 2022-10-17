const got = require('@/utils/got');
const cheerio = require('cheerio');
const asyncPool = require('tiny-async-pool');

const rootURL = 'https://www.uber.com';
const pageURL = rootURL + '/blog/pittsburgh/engineering/page';

module.exports = async (ctx) => {
    let articles = [];

    let maxPage = Number(ctx.params.maxPage);
    if (Number.isNaN(maxPage)) {
        maxPage = 1;
    }

    for await (const items of asyncPool(
        2,
        Array.from({ length: maxPage }, (_, i) => i),
        (idx) => {
            const url = pageURL + `/${idx + 1}`;

            return ctx.cache.tryGet(url, async () => {
                const resp = await got.get(url);
                const $ = cheerio.load(resp.data);
                const list = $('#content div a').get();
                return list
                    .map((item) => {
                        const title = $(item).attr('aria-label');
                        const link = $(item).attr('href');
                        return {
                            title,
                            link,
                        };
                    })
                    .filter((item) => typeof item.title !== 'undefined');
            });
        }
    )) {
        articles = articles.concat(items);
    }

    const result = [];
    for await (const data of asyncPool(2, articles, (article) => {
        const link = rootURL + article.link;

        return ctx.cache.tryGet(link, async () => {
            const resp = await got(link);
            const $ = cheerio.load(resp.data);

            const publish_time = $('meta[property="article:published_time"]').attr('content');
            const description = $('#content').html();
            if (typeof publish_time === 'undefined') {
                return {
                    link,
                    title: article.title,
                };
            }

            return {
                link,
                description,
                title: article.title,
                pubDate: new Date(publish_time).toUTCString(),
            };
        });
    })) {
        result.push(data);
    }

    ctx.state.data = {
        title: `Uber Engineering Blog`,
        link: rootURL + '/blog/engineering',
        description: 'The technology behind Uber Engineering',
        item: result,
    };
};
