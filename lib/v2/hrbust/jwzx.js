const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'http://jwzx.hrbust.edu.cn/homepage/';

const typeMap = {
        351: {
            id:'351',
            name: '名师风采'
        },
        352: {
            id:'352',
            name: '网站链接'
        },
        353: {
            id:'353',
            name: '热点新闻'
        },
        354: {
            id:'354',
            name: '教务公告'
        },
        355: {
            id:'355',
            name: '教学新闻'
        }
};

module.exports = async (ctx) => {
    const page = ctx.params.page || '12';
    const type = ctx.params.type || '354';
    const link = baseUrl + 'infoArticleList.do?columnId=' + typeMap[type].id + '&pagingNumberPer=' + page;
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('.articleList li div')
        .toArray()
        .map((el) => {
            el = $(el);
            return {
                link: new URL(el.find('a').attr('href'), baseUrl).href,
                title: el.find('a').first().text(),
                pubDate: parseDate(el.find('span').first().text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async() => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                const description =
                    $('div.body').html() &&
                    $('div.body')
                        .html()
                        .replace(/style="(.*?)"/g, '')
                        .trim();
                item.description = description;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '哈理工教务处' + typeMap[type].name,
        link,
        item: items
    };
};
