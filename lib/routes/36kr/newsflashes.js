const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { keyword = '' } = ctx.params;
    const csrfresponse = await got.get('https://36kr.com/pp/api/csrf');
    const cookies = csrfresponse.headers['set-cookie'].toString();
    const token = cookies.match(/M-XSRF-TOKEN=.{64}/)[0];
    const acw_tc = cookies.match(/acw_tc=.{61}/)[0];
    const krnewsfrontss = cookies.match(/krnewsfrontss=.{32}/)[0];

    const response = await got({
        method: 'get',
        url: `https://36kr.com/api/newsflash`,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            cookie: `${token};${acw_tc};${krnewsfrontss};`,
            'M-X-XSRF-TOKEN': token.replace('M-XSRF-TOKEN=', ''),
        },

    });

    const newsflashes = response.data.items;

    let newsflashesList = [];
    for (let i = 0; i < newsflashes.length; i++) {
        newsflashesList = newsflashesList.concat(newsflashes[i]);
    }

    const out = newsflashesList.map((item) => {
        const date = item.published_at;
        const link = item.news_url;
        const title = item.title;
        const description = item.description;

        const single = {
            title,
            link,
            pubDate: new Date(date).toUTCString(),
            description,
        };

        return single;
    });

    ctx.state.data = {
        title: `快讯 - 36氪`,
        link: `https://36kr.com/newsflashes`,
        item: out,
    };
};
