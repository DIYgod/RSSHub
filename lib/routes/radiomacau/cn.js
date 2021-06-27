const got = require('@/utils/got');
const cheerio = require('cheerio');

async function brief(ctx, list) {
    const now = list.map(
        async (line) =>
            await ctx.cache.tryGet(line, async () => {
                const a_r = await got.get(`${line}`);
                const $ = cheerio.load(a_r.data);
                // title
                const title = $('div.post h2.title').text();
                // tag
                const [, tag, date, time_r] = $('div.post p.byline')
                    .text()
                    .match(/\[(.*)\] Post by (\d+-\d+-\d+) (\d+:\d+:\d+)/);
                // time
                const time = new Date(`${date}T${time_r}+0800`).toUTCString();
                // desc
                const ptext_r = $('div.entry').text();
                const ptext = ptext_r.replace(/.?-{13,}(.|\n)*/gm, '');
                const content = `<p>${ptext}<br><br>#${tag} (${date} ${time_r})</p>`;
                // link
                const [, id] = line.match(/https:\/\/mobile-tdm-com-mo\.translate\.goog\/cn\/index_pop\.php\?se=inews&type=all&nid=(.*)&start=0&_x_tr_sl=zh-CN&_x_tr_tl=zh-TW&_x_tr_hl=zh-TW&_x_tr_pto=ajax,op/);

                return {
                    title: title,
                    description: content,
                    pubDate: time,
                    link: `https://www.tdm.com.mo/c_news/radio_news.php?id=${id}`,
                };
            })
    );
    return await Promise.all(now);
}

module.exports = async (ctx) => {
    // const browser = await require('@/utils/puppeteer')();
    // const page = await browser.newPage();
    // const link = 'https://mobile.tdm.com.mo/cn/index_pop.php?se=inews&type=all';
    // await page.goto(link);
    // const html = await page.evaluate(
    //     () =>
    //         document.querySelector('div#borderContainer').innerHTML
    // );
    // browser.close();

    const response = await got({
        method: 'get',
        url: 'https://mobile-tdm-com-mo.translate.goog/cn/index_pop.php?se=inews&type=all&_x_tr_sl=zh-CN&_x_tr_tl=zh-TW&_x_tr_hl=zh-TW&_x_tr_pto=ajax,op',
    });

    const $ = cheerio.load(response.data);
    const dom = $('div.post');
    const relink = dom.map((_index, li) => $(li).find('a').first().attr('href'));
    const list = relink.toArray();

    const rss = await brief(ctx, list);
    ctx.state.data = {
        title: '澳門電台',
        link: 'https://www.tdm.com.mo/c_news/radio_news.php',
        item: rss,
    };
};
