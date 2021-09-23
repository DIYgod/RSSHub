const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://aerospace.xmu.edu.cn';

const urlMap = {
    tzgg: '/xydt/tzgg.htm',
    bksjw: '/jwxx/bksjw.htm',
    yjsjw: '/jwxx/yjsjw.htm',
};

const titleMap = {
    tzgg: '通知公告',
    bksjw: '本科生教务',
    yjsjw: '研究生教务',
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
            const $a = item.find('a');
            return {
                title: $a.attr('title'),
                link: host + $a.attr('href').slice(2),
            };
        })
        .get();

    const result = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data, { decodeEntities: false });

                item.description = content('#vsb_content > div').html();

                const date = content('body > div.centers > div.other_right > form > div > div.news-info.clearfix > span:nth-child(2)').text();
                item.pubDate = parseDate(date, '发布时间：YYYY年MM月DD日');

                return item;
            })
        )
    );
    ctx.state.data = {
        title: titleMap[type],
        link: host,
        item: result,
    };
};
