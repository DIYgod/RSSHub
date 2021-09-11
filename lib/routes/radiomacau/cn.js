const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

function entry(ctx, list) {
    const now = list.map((line) =>
        ctx.cache.tryGet(line, async () => {
            const articleRaw = await got.get(`${line}`);
            const $ = cheerio.load(articleRaw.data);

            const title = $('div.post h2.title').text();
            const [, category, date] = $('div.post p.byline')
                .text()
                .match(/\[(.*)\] Post by (\d+-\d+-\d+ \d+:\d+:\d+)/);
            const descRaw = $('div.entry div').first().html();
            const description = descRaw.replace(/.?-{13,}(.|\n)*/gm, '');
            const [, id] = line.match(/.*&nid=(.*)&start=.*/); // newsID

            return {
                title,
                category,
                description,
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
        let feedTitle;
        if (category === 'all') {
            feedTitle = '澳門電台';
        } else if (category === 'local') {
            feedTitle = '本地新聞 - 澳門電台';
        } else if (category === 'global') {
            feedTitle = '國際新聞 - 澳門電台';
        } else if (category === 'bothsides') {
            feedTitle = '兩岸新聞 - 澳門電台';
        } else if (category === 'topic') {
            feedTitle = '專題新聞 - 澳門電台';
        }

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
            title: feedTitle,
            link: 'https://www.tdm.com.mo/c_news/radio_news.php',
            item: rss,
        };
    } else {
        throw Error(`Invalid category ‘<code>${category}</code>’. Please refer to <a href="https://docs.rsshub.app/traditional-media.html#ao-men-dian-tai">the documention</a>.`);
    }
};
