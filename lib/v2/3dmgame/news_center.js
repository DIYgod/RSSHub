const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { parseArticle } = require('./utils');

module.exports = async (ctx) => {
    const { category = '' } = ctx.params;
    const isArcPost = category && !isNaN(category); // https://www.3dmgame.com/news/\d+/
    const url = `https://www.3dmgame.com/${category && category !== 'news_36_1' ? 'news/' : ''}${category ? category : 'news'}/`;
    const res = await got(url);
    const $ = cheerio.load(res.data);
    const list = $(isArcPost ? '.selectarcpost' : '.selectpost')
        .toArray()
        .map((item) => {
            item = $(item);
            if (isArcPost) {
                return {
                    title: item.find('.bt').text(),
                    link: item.attr('href'),
                    description: item.find('p').text(),
                    pubDate: timezone(parseDate(item.find('.time').text().trim()), 8),
                };
            }
            const a = item.find('.text a');
            return {
                title: a.text(),
                link: a.attr('href'),
                description: item.find('.miaoshu').text(),
                pubDate: timezone(parseDate(item.find('.time').text().trim()), 8),
            };
        });

    const out = await Promise.all(list.map((item) => parseArticle(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: '3DM - ' + $('title').text().split('_')[0],
        description: $('meta[name="Description"]').attr('content'),
        link: url,
        item: out,
    };
};
