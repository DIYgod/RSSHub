const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const { eecsMap } = require('./utils');

module.exports = async (ctx) => {
    const host = 'https://eecs.pku.edu.cn';

    let type = ctx.params && parseInt(ctx.params.type);
    if (type === undefined) {
        type = 0;
    }

    const response = await got(host + '/xygk1/ggtz/' + eecsMap.get(type));

    const $ = cheerio.load(response.data);
    let items = $('.hvr-shutter-out-vertical')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.attr('title'),
                link: new URL(item.attr('href'), host).href,
                pubDate: parseDate(item.find('em').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detail = await got(item.link);
                const content = cheerio.load(detail.data);

                content('input').remove();
                content('h1').remove();
                content('.con_xq').remove();

                content('form[name=_newscontent_fromname] img').each((_, i) => {
                    i = $(i);
                    if (i.attr('src').startsWith('/')) {
                        i.attr('src', new URL(i.attr('src'), host).href);
                    }
                });
                content('form[name=_newscontent_fromname] ul li a').each((_, a) => {
                    a = $(a);
                    if (a.attr('href').startsWith('/')) {
                        a.attr('href', new URL(a.attr('href'), host).href);
                    }
                });

                item.description = content('form[name=_newscontent_fromname]').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: host + '/xygk1/ggtz/' + eecsMap.get(type),
        description: '北大信科 公告通知',
        item: items,
    };
};
