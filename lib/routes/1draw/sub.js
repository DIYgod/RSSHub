const got = require('@/utils/got');

module.exports = async (ctx) => {
    const host = 'http://1draw.aqn.jp';
    const day = ctx.params.day;

    const response = await got(`${host}/${day}`);
    const content = response.data;

    // 使用了正则匹配 Javascript 数据，对字符串处理解析成 JSON，可能失效
    const dateRegex = /\[\];(?<data>.*?)var/s;
    const matches = content
        .match(dateRegex)
        .groups.data.replace(/data\.push\(/gm, '')
        .replace(/\);/gm, ',')
        .replace(/(screen_name|id|allow|img):/gm, '"$1":');
    const matchArr = '[' + matches.slice(0, matches.lastIndexOf(',')) + ']';
    const items = JSON.parse(matchArr);

    ctx.state.data = {
        title: '1draw',
        link: 'http://1draw.aqn.jp/',
        item: items.map((item) => ({
            title: `${item.screen_name}の投稿イラスト`,
            description: `<img src="${item.img}">`,
            link: `https://twitter.com/${item.screen_name}/status/${item.id}`,
        })),
    };
};
