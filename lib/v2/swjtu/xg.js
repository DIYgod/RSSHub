const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootURL = 'http://xg.swjtu.edu.cn';
const listURL = {
    tzgg: `${rootURL}/web/Home/PushNewsList?Lmk7LJw34Jmu=010j.shtml`,
    yhxw: `${rootURL}/web/Home/NewsList?LJw34Jmu=011e.shtml`,
    dcxy: `${rootURL}/web/Home/ColourfulCollegeNewsList`,
    xgzj: `${rootURL}/web/Home/NewsList?xvw34vmu=010e.shtml`,
};

const getItem = (item, cache) => {
    const news_info = item.find('h4').find('a');
    const news_time = item.find('span.ctxlist-time').text();
    const info_title = news_info.text();
    const link = `${rootURL}${news_info.attr('href')}`;
    return cache.tryGet(link, async () => {
        try {
            const resp = await got({
                method: 'get',
                url: link,
            });
            const $$ = cheerio.load(resp.data);
            let info_text = $$('.detail-content-text').html();
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
    const code = ctx.params.code ?? 'tzgg';
    const url_addr = listURL[code];

    if (!url_addr) {
        throw new Error('code not supported');
    }

    const resp = await got({
        method: 'get',
        url: url_addr,
    });

    const $ = cheerio.load(resp.data);
    const list = $('div.right-side ul.block-ctxlist li');

    const items = await Promise.all(
        list.toArray().map((i) => {
            const item = $(i);
            return getItem(item, ctx.cache);
        })
    );

    ctx.state.data = {
        title: '西南交大-扬华素质网',
        link: url_addr,
        item: items,
        allowEmpty: true,
    };
};
