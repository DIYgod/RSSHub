const got = require('@/utils/got');

function toJSONstr(content) {
    // 使用了正则匹配 Javascript 数据，对字符串处理解析成 JSON，可能失效
    const dateRegex = /\[\];(?<data>.*?)var/s;
    return content
        .match(dateRegex)
        .groups.data.replace(/data\.push\(/gm, '')
        .replace(/\);/gm, ',')
        .replace(/(screen_name|id|allow|img):/gm, '"$1":');
}

module.exports = async (ctx) => {
    const host = 'http://1draw.aqn.jp';

    const response = await got(`${host}/1`);
    const yesterday = response.data;

    let matches = toJSONstr(yesterday);

    // 东九区时间晚 10 点后尝试抓取今日
    if (new Date().getUTCHours() >= 13) {
        const response = await got(`${host}/0`);
        const today = response.data;
        try {
            matches += toJSONstr(today);
        } catch (e) {
            matches += '';
        }
    }

    const matchArr = `[ ${matches.slice(0, matches.lastIndexOf(','))} ]`;
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
