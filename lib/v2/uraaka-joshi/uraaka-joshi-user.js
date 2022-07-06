const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://www.uraaka-joshi.com/user/${id}`;

    const response = await ctx.cache.tryGet(
        link,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'fetch' ? request.continue() : request.abort();
            });

            await page.goto(link, {
                waitUntil: 'domcontentloaded',
            });
            await page.waitForSelector('#pickup03 .grid-cell');
            await page.waitForSelector('#pickup04 .grid-cell');
            await page.waitForSelector('#main-block .grid-cell');

            const html = await page.evaluate(() => document.documentElement.innerHTML);
            browser.close();
            return html;
        },
        config.cache.routeExpire,
        false
    );

    const $ = cheerio.load(response);
    const items = $('#main-block .grid .grid-cell')
        .toArray()
        .map((item) => {
            item = $(item);

            // remove event and styles
            item.find('*').removeAttr('onclick');
            item.find('*').removeAttr('onerror');
            item.find('*').removeAttr('style');

            // format account style
            const account = item.find('.account-group-link-row');
            account.html(account.text());

            // extract video tag from its player
            item.find('.plyr--video').each((_, player) => {
                player = $(player);

                const v = player.find('video');
                player.replaceWith(v);
                v.attr('poster', 'https:' + v.attr('data-poster'));
                v.find('source').attr('src', 'https:' + v.find('source').attr('src'));
            });

            // correct src of img tags
            item.find('img').each((_, i) => {
                i = $(i);
                i.attr('src', 'https:' + i.attr('data-src').split('?resize')[0]);
                i.removeAttr('data-src');
            });

            const author = item.find('.account-group').text();
            const categories = item
                .find('.hashtag-item .hashtag')
                .toArray()
                .map((c) => $(c).text().trim());
            const link = item.find('.account-group-link-row').attr('href');
            const date = parseDate(item.find('.profile-char').attr('datetime'));
            const guid = item.find('a.tap-image').attr('data-tweet-id') || item.find('video[class^="js-player-"]').attr('data-tweet-id');

            item.find('.grow-room').remove();
            item.find('div.profile-group.mt10.prl2').eq(1).remove();

            return {
                title: item.find('.profile-text').text(),
                description: item.html(),
                link,
                pubDate: date,
                guid,
                category: categories,
                author,
            };
        });

    ctx.state.data = {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link,
        item: items,
    };
};
