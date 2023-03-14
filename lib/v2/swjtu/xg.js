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
    const newsInfo = item.find('h4').find('a');
    const newsTime = item.find('span.ctxlist-time').text();
    const newsTitle = newsInfo.text();
    const link = `${rootURL}${newsInfo.attr('href')}`;
    return cache.tryGet(link, async () => {
        try {
            const resp = await got({
                method: 'get',
                url: link,
            });
            const $$ = cheerio.load(resp.data);
            let newsText = $$('.detail-content-text').html();
            if (!newsText) {
                newsText = '转发通知';
            }
            return {
                title: newsTitle,
                pubDate: parseDate(String(newsTime)),
                link,
                description: newsText,
            };
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return {
                    title: newsTitle,
                    pubDate: parseDate(String(newsTime)),
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
    const pageURL = listURL[code];

    if (!pageURL) {
        throw new Error('code not supported');
    }

    const resp = await got({
        method: 'get',
        url: pageURL,
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
        link: pageURL,
        item: items,
        allowEmpty: true,
    };
};
