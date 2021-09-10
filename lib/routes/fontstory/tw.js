const got = require('@/utils/got');
const cheerio = require('cheerio');

const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

function getArticle(ctx, list) {
    const now = list.map((line) =>
        ctx.cache.tryGet(line, async () => {
            const articleRaw = await got.get(`https://www.dynacw.com.tw/fontstory/${line}`);
            const $ = cheerio.load(articleRaw.data);
            const titleRaw = $('h2.col-xs-12.tc-deeppink').first().text();
            const tag = $('div.date-txt.col-xs-8.tc-gray').first().text();
            const timeRaw = $('div.date-txt.col-xs-4.tc-gray.text-right');
            $('main.container').find('ol.breadcrumb.hidden-xs').remove();
            $('main.container').find('section.row').first().remove();
            $('main.container').find('section.pages.row').remove();
            const desc = $('main.container').html();

            return {
                title: `${titleRaw}（${tag}）`,
                description: desc,
                pubDate: timezone(parseDate(timeRaw.text(), 'YYYY年MM月DD日'), +8),
                link: `https://www.dynacw.com.tw/fontstory/${line}`,
            };
        })
    );
    return Promise.all(now);
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

    const rss = await getArticle(ctx, list.slice(0, 10));
    ctx.state.data = {
        title: '字型故事｜華康字型',
        link: 'https://www.dynacw.com.tw/fontstory/fontstory.aspx',
        item: rss,
    };
};
