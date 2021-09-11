const got = require('@/utils/got');
const cheerio = require('cheerio');

const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

function entry(ctx, list) {
    const now = list.map((line) =>
        ctx.cache.tryGet(line, async () => {
            const articleRaw = await got.get(`${line}`);
            const $ = cheerio.load(articleRaw.data);

            const title = $('div.post h2.title').text();
            const description = $('div.entry div').first().html();
            const [, id] = line.match(/.*&nid=(.*)&start=.*/); //newsID

            return {
                title,
                description,
                pubDate: timezone(parseDate($('div.post p.byline').text(), 'YYYY-MM-DD HH:mm:ss'), +8),
                link: `https://port.tdm.com.mo/c_english/index.php?id=${id}`,
            };
        })
    );
    return Promise.all(now);
}

module.exports = async (ctx) => {
    const starts = [0, 10, 20];
    const urls = starts.map((start) => `https://mobile-tdm-com-mo.translate.goog/pt/index_pop.php?se=inews&type=en&start=${start}&_x_tr_sl=zh-CN&_x_tr_tl=zh-TW&_x_tr_hl=zh-TW&_x_tr_pto=ajax,op,elem`);

    const listRaw = await Promise.all(
        urls.map(async (url) => {
            const response = await got.get(url);
            const $ = cheerio.load(response.data);
            const list = $('div.post').map((_index, line) => $(line).find('a').first().attr('href'));
            return Promise.resolve(list.toArray());
        })
    );
    const list = [...new Set(listRaw.flat())]; // removed duplicates and flatten

    const rss = await entry(ctx, list);

    ctx.state.data = {
        title: 'English News - Rádio Macau',
        link: 'https://port.tdm.com.mo/c_english/',
        item: rss,
    };
};
