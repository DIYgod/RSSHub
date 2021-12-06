const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { keyword = '' } = ctx.params;
    const csrfresponse = await got.get('https://36kr.com/pp/api/csrf');
    const cookies = csrfresponse.headers['set-cookie'].toString();
    const token = cookies.match(/M-XSRF-TOKEN=.{64}/)[0];
    const acw_tc = cookies.match(/acw_tc=.{61}/)[0];
    const krnewsfrontss = cookies.match(/krnewsfrontss=.{32}/)[0];

    const timestamp = new Date().getTime();

    const response = await got({
        method: 'post',
        url: `https://gateway.36kr.com/api/mis/nav/search/resultbytype`,
        headers: {
            'Content-Type': 'application/json',
            cookie: `${token};${acw_tc};${krnewsfrontss};`,
            'M-X-XSRF-TOKEN': token.replace('M-XSRF-TOKEN=', ''),
        },
        data: JSON.stringify({
            param: {
                pageCallback: Buffer.from(
                    JSON.stringify({
                        firstId: 1,
                        lastId: 1,
                        firstCreateTime: timestamp,
                        lastCreateTime: timestamp,
                    })
                ).toString('base64'),
                pageEvent: 1,
                pageSize: 20,
                platformId: 2,
                searchType: 'article',
                searchWord: keyword,
                siteId: 1,
                sort: 'date',
            },
            partner_id: 'web',
            timestamp,
        }),
    });

    const load = async (link) => {
        const response = await got.get(link);
        const description = response.data.match(/"widgetContent":"(.*?)","sourceType":/)[1];
        return { description };
    };

    const items = await Promise.all(
        (response.data.data.itemList || []).map(async (item) => {
            const link = `https://www.36kr.com/p/${item.itemId}`;
            const single = {
                title: item.widgetTitle,
                link,
                pubDate: new Date(item.publishTime).toUTCString(),
            };

            const other = await ctx.cache.tryGet(link, () => load(link));
            return Promise.resolve(Object.assign({}, single, other));
        })
    );

    ctx.state.data = {
        title: `36kr - ${keyword}`,
        link: `https://www.36kr.com/search/articles/${encodeURIComponent(keyword)}`,
        item: items,
    };
};
