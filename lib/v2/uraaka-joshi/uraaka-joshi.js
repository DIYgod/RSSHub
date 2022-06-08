const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = `https://www.uraaka-joshi.com/`;
    const title = `裏垢女子まとめ`;

    const browser = await require('@/utils/puppeteer')();

    const page = await browser.newPage();
    await page.goto(link);

    await page.waitForSelector('#pickup03 .grid-cell');
    await page.waitForSelector('#pickup04 .grid-cell');
    await page.waitForSelector('#main-block .grid-cell');

    const bodyHandle = await page.$('body');
    const html = await page.evaluate((body) => body.innerHTML, bodyHandle);
    browser.close();
    const $ = cheerio.load(html);
    const list = $('.grid-cell');

    ctx.state.data = {
        title,
        link,
        item:
            list &&
            list
                .map((index, item) => {
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

                        const video = player.find('video');
                        player.replaceWith(video);
                        const poster = video.attr('data-poster');
                        video.attr('poster', 'https:' + poster);

                        const source = video.find('source');
                        const src = source.attr('src');
                        source.attr('src', 'https:' + src);
                    });

                    // correct src of img tags
                    item.find('img').each((_, image) => {
                        const src = $(image).attr('data-src');
                        $(image).attr('src', 'https:' + src);
                    });

                    return {
                        title: item.find('.account-group').text() + ` - ${title}`,
                        description: item.html(),
                        link: item.find('.account-group-link-row').attr('href'),
                        pubDate: parseDate(item.find('.profile-char').attr('datetime')),
                        guid: item.find('a.tap-image').attr('data-tweet-id') || item.find('video[class^="js-player-"]').attr('data-tweet-id') || parseDate(item.find('.profile-char').attr('datetime')).getTime(),
                    };
                })
                .get(),
    };
};
