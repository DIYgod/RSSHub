const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://lvv2.com';

const titleMap = {
    'sort-realtime': {
        't-month': '24小时榜 一月内',
        't-week': '24小时榜 一周内',
        't-day': '24小时榜 一天内',
        't-hour': '24小时榜 一小时内',
    },
    'sort-hot': '热门',
    'sort-new': '最新',
    'sort-score': {
        't-month': '得分 一月内',
        't-week': '得分 一周内',
        't-day': '得分 一天内',
        't-hour': '得分 一小时内',
    },
};

module.exports = async (ctx) => {
    const channel = ctx.params.channel;
    const sort = (channel === 'sort-realtime' || channel === 'sort-score') && !ctx.params.sort ? 't-week' : ctx.params.sort;
    const url = `${rootUrl}/${channel}/${sort}`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('div.spacer > div')
        .map((_, item) => ({
            title: $(item).find('h3 > a.title').text().trim(),
            author: $(item).find('a.author').text().trim(),
            link: new URL($(item).find('h3.title > a.title').attr('href'), rootUrl).href.replace(/(https:\/\/lvv2\.com.*?)\/title.*/, '$1'),
            pubDate: timezone(parseDate($(item).find('a.dateline > time').attr('datetime')), +8),
        }))
        .filter((_, item) => item.title !== '')
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.link.indexOf('instant.lvv2.com') !== -1) {
                    item.description = await ctx.cache.tryGet(item.link, async () => {
                        const articleResponse = await got(item.link);
                        const article = cheerio.load(articleResponse.data);

                        const description = article('#_tl_editor')
                            .html()
                            .replace(/src=['|"]data.*?['|"]/g, '')
                            .replace(/(<img.*?)data-src(.*?>)/g, '$1src$2');

                        return description;
                    });
                } else {
                    item.description = art(path.join(__dirname, 'templates/outlink.art'), {
                        outlink: item.link,
                    });
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `lvv2 - ${sort ? titleMap[channel][sort] : titleMap[channel]}`,
        link: url,
        item: items,
    };
};
