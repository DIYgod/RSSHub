const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const link = `https://so.eastmoney.com/News/s?KeyWord=${keyword}`;
    const body = {
        uid: '',
        keyword,
        type: ['cmsArticleWebOld'],
        client: 'web',
        clientType: 'web',
        clientVersion: 'curr',
        params: {
            cmsArticleWebOld: {
                searchScope: 'default',
                sort: 'default',
                pageIndex: 1,
                pageSize: 10,
                preTag: '<em>',
                postTag: '</em>',
            },
        },
    };
    const cb = `jQuery${('3.5.1' + Math.random()).replace(/\D/g, '')}_${Date.now()}`;

    const url = `https://search-api-web.eastmoney.com/search/jsonp`;

    const response = await got(url, {
        searchParams: {
            cb,
            param: JSON.stringify(body),
        },
    });
    const data = response.data;

    const extractedText = data.match(/jQuery\d+_\d+\((.*)\)/)[1];

    const obj = JSON.parse(extractedText);
    const arr = obj.result.cmsArticleWebOld;

    const items = arr.map((item) => ({
        title: item.title,
        description: item.content,
        pubDate: timezone(parseDate(item.date), 8),
        link: item.url,
        author: item.mediaName,
    }));
    ctx.state.data = {
        title: `东方财富网 - 搜索'${keyword}'`,
        link,
        item: items,
    };
};
