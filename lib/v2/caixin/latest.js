const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');
const { parseAppDate, caixinLogin } = require('./utils');

module.exports = async (ctx) => {
    await caixinLogin(ctx);

    const li_r = await got('https://www.caixin.com/2021-08-22/101758426.html');

    const $ = cheerio.load(li_r.data);
    const list = $('div.columnBox a[name="new_artical"]~ul.list li')
        .toArray()
        .map((li) => ({
            link: $(li).find('a').first().attr('href').replace('http://', 'https://'),
        }))
        .filter((item) => !item.link.startsWith('https://fm.caixin.com/') && !item.link.startsWith('https://video.caixin.com/') && !item.link.startsWith('https://datanews.caixin.com/')); // content filter

    const rss = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(`caixin:latest:${item.link}`, async () => {
                const entry_r = await got(item.link);
                const $ = cheerio.load(entry_r.data);
                // title
                item.title = $('div#conTit h1').text();
                if (config.caixin.login_url) {
                    let item_pay = await ctx.cache.get(item.link + "#pay");
                    if (item_pay) {
                        item = item_pay;
                    } else {
                        await parseAppDate(item, ctx);
                        if (item.pay) await ctx.cache.set(item.link + "#pay", item, Math.max(config.cache.contentExpire, 24 * 60 * 60));
                    }
                }
                if (!item.description) {
                    item.description = art(path.join(__dirname, 'templates/article.art'), {
                        item,
                        $,
                    });
                }

                item.pubDate = timezone(parseDate($('#pubtime_baidu').text()), +8);
                // prevent cache coliision with /caixin/article and /caixin/:column/:category
                // since those have podcasts
                item.guid = `caixin:latest:${item.link}`;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '财新网 - 最新文章',
        link: 'https://www.caixin.com/',
        item: rss,
    };
};
