const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const asyncPool = require('tiny-async-pool');

module.exports = async (ctx) => {
    const { type, magazine } = ctx.params;
    const path = `paper/${type}/${magazine}`;
    const link = new URL(path, utils.host).href;
    const response = await got(link, {
        headers: {
            Cookie: 'journalIndexViewType=grid',
        },
    });
    const data = response.data;
    const $ = cheerio.load(data);

    const newsItem = $('.magazine-model-content-new li')
        .toArray()
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit, 10) : 20)
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.magazine-text-title a').text().trim(),
                link: new URL(item.find('.magazine-model-btn a').first().attr('href'), utils.host).href,
                pubDate: timezone(
                    parseDate(
                        item
                            .find('.magazine-text-atten')
                            .text()
                            .match(/\d{4}-\d{2}-\d{2}/)[0],
                        8
                    )
                ),
            };
        });

    const asyncPoolAll = async (...args) => {
        const results = [];
        for await (const result of asyncPool(...args)) {
            results.push(result);
        }
        return results;
    };

    const item = await asyncPoolAll(2, newsItem, (element) =>
        ctx.cache.tryGet(element.link, async () => {
            const response = await got(element.link);
            const $ = cheerio.load(response.data);

            const description = $('.maga-content');
            element.doi = description.find('.itsmblue').eq(1).text().trim();

            description.find('.itgaryfirst').remove();
            description.find('span').eq(0).remove();
            element.author = description.find('span').eq(0).text().trim();
            description.find('span').eq(0).remove();

            element.description = description.html();

            return element;
        })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: response.url,
        description: $('meta[name="description"]').attr('content'),
        item,
    };
};
