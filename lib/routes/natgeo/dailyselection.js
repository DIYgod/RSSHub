const got = require('@/utils/got');
const parseDate = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const host = 'http://dili.bdatu.com/jiekou/mains/p1.html';
    const data = await got.get(host);

    const sort = data.data.album[1].sort;

    const api = 'http://dili.bdatu.com/jiekou/albums/a' + sort + '.html';
    const response = await got.get(api);

    const items = response.data.picture;
    const out = new Array;

    items.map((item) => {
        const info = {
            title: item.title,
            link: item.url,
            description: `<img src="${item.url}"><br>` + item.content,
            pubDate: parseDate(item.addtime,'YYYY/MM/DD'),
            guid: item.id,
        };
        out.push(info);
        return info;
    });

    ctx.state.data = {
        title: 'Photo of the Daily Selection',
        link: api,
        item: out,
    };
};