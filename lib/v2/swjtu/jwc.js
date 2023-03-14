const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootURL = 'http://jwc.swjtu.edu.cn';
const url_addr = `${rootURL}/vatuu/WebAction?setAction=newsList`;

const getItem = (item, cache) => {
    const news_info = item.find('h3').find('a');
    const news_time = item.find('p').find('span').text().slice(0, 19);
    const info_title = news_info.text();
    const link = `${rootURL}${news_info.attr('href').slice(2)}`;
    return cache.tryGet(link, async () => {
        try {
            const resp = await got({
                method: 'get',
                url: link,
            });
            const $$ = cheerio.load(resp.data);
            let info_text = $$('.content-main').html();
            if (!info_text) {
                info_text = '转发通知';
            }
            return {
                title: info_title,
                pubDate: parseDate(String(news_time)),
                link,
                description: info_text,
            };
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return {
                    title: info_title,
                    pubDate: parseDate(String(news_time)),
                    link,
                    description: '',
                };
            } else {
                throw error;
            }
        }
    });
};

module.exports = async (ctx) => {
    const resp = await got({
        method: 'get',
        url: url_addr,
    });

    const $ = cheerio.load(resp.data);
    const list = $("[class='littleResultDiv']");

    const items = await Promise.all(
        list.toArray().map((i) => {
            const item = $(i);
            return getItem(item, ctx.cache);
        })
    );

    ctx.state.data = {
        title: '西南交大-教务网通知',
        link: url_addr,
        item: items,
        allowEmpty: true,
    };
};
