const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
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
    const cb = 'jQuery123';

    const url = `https://search-api-web.eastmoney.com/search/jsonp?cb=${cb}&param=${encodeURIComponent(JSON.stringify(body))}`;

    const response = await got(url);
    const data = response.data;

    // 找到左括号的位置
    const leftParenthesisIndex = data.indexOf('(');
    // 找到右括号的位置
    const rightParenthesisIndex = data.lastIndexOf(')');
    // 使用substring()方法提取两个括号之间的内容
    const extractedText = data.substring(leftParenthesisIndex + 1, rightParenthesisIndex);

    const obj = JSON.parse(extractedText);
    const arr = obj.result.cmsArticleWebOld;

    const items = arr.map((item) => {
        const i = {
            title: item.title,
            description: item.content,
            pubDate: parseDate(item.date),
            link: item.url,
        };
        return i;
    });
    ctx.state.data = {
        title: `东方财富网 - 搜索'${keyword}'`,
        link: url,
        item: items,
    };
};
