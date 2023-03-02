const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const host = 'http://dili.bdatu.com/jiekou/mains/p1.html';
    const data = await got(host);

    let sort = 0;
    let addtime = '';

    for (let i = 0; i < data.data.album.length; i++) {
        if (parseInt(data.data.album[i].ds) === 1) {
            sort = data.data.album[i].sort;
            addtime = data.data.album[i].addtime;
            break;
        }
    }
    const api = 'http://dili.bdatu.com/jiekou/albums/a' + sort + '.html';
    const response = await got(api);
    const items = response.data.picture;
    const out = new Array();

    items.map((item) => {
        const info = {
            title: item.title,
            link: item.url,
            description: `<img src="${item.url}"><br>` + item.content,
            pubDate: timezone(parseDate(addtime), +0),
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
