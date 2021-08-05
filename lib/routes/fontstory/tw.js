const got = require('@/utils/got');
const cheerio = require('cheerio');

const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

async function getArticle(ctx, list) {
    const now = list.map(
        async (line) =>
            await ctx.cache.tryGet(line, async () => {
                const a_r = await got.get(`https://www.dynacw.com.tw/fontstory/${line}`);
                const $ = cheerio.load(a_r.data);
                // title
                const title = $('h2.col-xs-12.tc-deeppink').first().text();
                // time
                // const [, yyyy, mm, dd] = $('div.date-txt.col-xs-4.tc-gray.text-right')
                //     .text()
                //     .match(/(\d+)年(\d+)月(\d+)日/);
                // const time = new Date(`${yyyy}-${mm}-${dd}+0800`).toUTCString();
                // desc
                const desc = $('main.container').html();

                return {
                    title: title,
                    description: desc,
                    pubDate: timezone(parseDate($('div.date-txt.col-xs-4.tc-gray.text-right').text(), 'YYYY年MM月DD日'), +8),
                    link: `https://www.dynacw.com.tw/fontstory/${line}`,
                };
            })
    );
    return await Promise.all(now);
}

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.dynacw.com.tw/fontstory/fontstory.aspx',
    });

    const $ = cheerio.load(response.data);
    const dom = $('div.font-item.col-xs-12');
    const relink = dom.map((_index, li) => $(li).find('a').first().attr('href'));
    const list = relink.toArray();

    const rss = await getArticle(ctx, list.slice(0, 5));
    ctx.state.data = {
        title: '字型故事｜華康字型',
        link: 'https://www.dynacw.com.tw/fontstory/fontstory.aspx',
        item: rss,
    };
};
