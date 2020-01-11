const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { keyword = '' } = ctx.params;
    const csrfresponse = await got.get('https://36kr.com/pp/api/csrf');
    const cookies = csrfresponse.headers['set-cookie'].toString();
    const token = cookies.match(/M-XSRF-TOKEN=.{64}/)[0];
    const acw_tc = cookies.match(/acw_tc=.{61}/)[0];
    const krnewsfrontss = cookies.match(/krnewsfrontss=.{32}/)[0];

    const response = await got({
        method: 'post',
        url: `https://36kr.com/pp/api/search/entity-search`,
        headers: {
            'Content-Type': 'application/json',
            cookie: `${token};${acw_tc};${krnewsfrontss};`,
            'M-X-XSRF-TOKEN': token.replace('M-XSRF-TOKEN=', ''),
        },
        data: JSON.stringify({
            page: 1,
            per_page: 20,
            sort: 'date',
            entity_type: 'post',
            keyword: keyword,
        }),
    });

    const load = async (link) => {
        const response = await got.get(link);
        const description = response.data.data.content;
        return { description };
    };

    const items = await Promise.all(
        (response.data.data.items || []).map(async (item) => {
            const link = `https://36kr.com/api/post/${item.id}`;
            const single = {
                title: item.title,
                link: `https://www.36kr.com/p/${item.id}`,
                pubDate: new Date(item.published_at).toUTCString(),
            };

            const other = await ctx.cache.tryGet(link, async () => await load(link));
            return Promise.resolve(Object.assign({}, single, other));
        })
    );

    ctx.state.data = {
        title: `36kr - ${keyword}`,
        link: `https://www.36kr.com/search/articles/${encodeURIComponent(keyword)}`,
        item: items,
    };
};
