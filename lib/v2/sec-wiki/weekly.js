const got = require('@/utils/got');
// const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { data } = await got('https://www.sec-wiki.com/weekly/index');
    const items = Array.from(data.matchAll(/\/weekly\/(\d+)">(.+?)<\/a><\/h5>\s*<p>(.+?)<\/p>/g)).map((item) => ({
        title: item[2],
        link: `https://www.sec-wiki.com/weekly/${item[1]}`,
        description: item[3],
    }));
    ctx.state.data = {
        title: 'SecWiki-安全维基',
        link: 'https://www.sec-wiki.com/',
        item: items,
    };
};
