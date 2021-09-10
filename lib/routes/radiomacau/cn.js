const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

function entry(ctx, list) {
    const now = list.map((line) =>
        ctx.cache.tryGet(line, async () => {
            const a_r = await got.get(`${line}`);
            const $ = cheerio.load(a_r.data);
            // title
            const title = $('div.post h2.title').text();
            // tag
            const [, tag, date] = $('div.post p.byline')
                .text()
                .match(/\[(.*)\] Post by (\d+-\d+-\d+ \d+:\d+:\d+)/);
            // desc
            const ptext_r = $('div.entry').text();
            const content = ptext_r.replace(/.?-{13,}(.|\n)*/gm, '');
            // link
            const [, id] = line.match(/.*&nid=(.*)&start=.*/);

            return {
                title: title,
                category: tag,
                description: content,
                pubDate: timezone(new Date(`${date}`), +8),
                link: `https://www.tdm.com.mo/c_news/radio_news.php?id=${id}`,
            };
        })
    );
    return Promise.all(now);
}

module.exports = async (ctx) => {
    const category = ctx.params.category || 'all';
    if (['all', 'local', 'global', 'bothsides', 'topic'].indexOf(category) >= 0) {
        const response = await got({
            method: 'get',
            url: `https://mobile-tdm-com-mo.translate.goog/cn/index_pop.php?se=inews&type=${category}&_x_tr_sl=zh-CN&_x_tr_tl=zh-TW&_x_tr_hl=zh-TW&_x_tr_pto=ajax,op,elem`,
        });

        const $ = cheerio.load(response.data);
        const dom = $('div.post');
        const relink = dom.map((_index, li) => $(li).find('a').first().attr('href'));
        const list = relink.toArray();

        const rss = await entry(ctx, list);
        ctx.state.data = {
            title: '澳門電台',
            link: 'https://www.tdm.com.mo/c_news/radio_news.php',
            item: rss,
        };
    } else {
        throw Error(`Invalid category ‘<code>${category}</code>’. Please refer to <a href="https://docs.rsshub.app/traditional-media.html">the documention</a>.`);
    }
};
