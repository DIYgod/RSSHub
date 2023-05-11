const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { parseArticle } = require('../../utils');

module.exports = async (ctx) => {
    const { cids = '57045' } = ctx.params;
    const { limit = '50' } = ctx.query;
    const { data: response } = await got('https://interface.sina.cn/pc_api/public_news_data.d.json', {
        searchParams: {
            cids,
            pdps: '',
            smartFlow: '',
            editLevel: '0,1,2,3',
            type: 'std_news,std_slide,std_video',
            pageSize: limit,
            cTime: '1483200000',
            tm: Date.now(),
            up: '0',
            action: '0',
            _: new Date().getTime(),
        },
    });
    const list = response.data.map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: parseDate(item.ctime, 'X'),
        author: item.media,
    }));

    const items = await Promise.all(list.map((item) => parseArticle(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: '美股|美股行情|美股新闻 - 新浪财经',
        link: 'https://finance.sina.com.cn/stock/usstock/',
        item: items,
    };
};
