const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://aerospace.xmu.edu.cn';

const urlMap = {
    tzgg: '/xydt/tzgg.htm',
    bksjw: '/jwxx/bksjw.htm',
    yjsjw: '/jwxx/yjsjw.htm'
};

const titleMap = {
    tzgg: '通知公告',
    bksjw: '本科生教务',
    yjsjw: '研究生教务'
};

module.exports = async (ctx) => {
    const type = ctx.params.type || '';
    const response = await got({
        method: 'get',
        url: host + urlMap[type],
    });
    const data = response.data;

    const $ = cheerio.load(data, { decodeEntities: false });

    const list = $('body > div.centers > div.other_right > ul > li')
        .map((index, item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: item.find('a').attr('href'),
            };
        })
        .get();

    const result = await Promise.all(
        list.map(async (item) => {
            const link = host + item.link.slice(2,);
            const cache = await ctx.cache.tryGet(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemResponse = await got({ method: 'get', url: link, responseType: 'buffer' });
            const itemElement = cheerio.load(itemResponse.data, { decodeEntities: false });
            item.description = itemElement('#vsb_content > div').html();

            const date = itemElement('body > div.centers > div.other_right > form > div > div.news-info.clearfix > span:nth-child(2)').text();
            item.pubDate = parseDate(date, '发布时间：YYYY年MM月DD日');

            ctx.cache.set(link, JSON.stringify(item));
            return item;
        })
    );
    ctx.state.data = {
        title: titleMap[type],
        link: host,
        item: result,
    };
};
