const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const gbk2utf8 = (s) => iconv.decode(s, 'gbk');
module.exports = async (ctx) => {
    const baseUrl = 'https://www.stbu.edu.cn';
    const requestUrl = `${baseUrl}/html/news/xueyuan/`;
    const { data: response } = await got(requestUrl, {
        responseType: 'buffer',
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(gbk2utf8(response));
    const list = $('.style_2 .Simple_title')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link, {
                    responseType: 'buffer',
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const $ = cheerio.load(gbk2utf8(response));
                item.description = $('.artmainl .articlemain').first().html();
                item.pubDate = timezone(parseDate($('.artmainl .info').text().split('|')[2].split('：')[1].trim()), +8);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '四川工商学院 - 学院新闻',
        link: requestUrl,
        description: '四川工商学院 - 学院新闻',
        item: items,
    };
};
