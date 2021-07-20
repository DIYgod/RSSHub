const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const language = ctx.params.language || 'en';
    const bar = '-'.repeat(language.length > 2 ? 74 : 58);

    const rootUrl = 'https://potplayer.daum.net';
    const currentUrl = `${rootUrl}/?lang=${language}`;

    const link = await ctx.cache.tryGet(currentUrl, async () => {
        const response = await got({
            method: 'get',
            url: currentUrl,
        });
        return response.data.match(/<a href="(.*)" class="link_update">/)[1];
    });

    const response = await got({
        method: 'get',
        url: link,
    });

    const list = response.data.split(`\r\n\r\n${bar}\r\n`);

    const items = list.slice(1, 10).map((item) => {
        const pubDate = parseDate(item.substr(1, 6), 'YYMMDD');

        return {
            pubDate,
            link: currentUrl,
            title: item.substr(1, 6),
            description: `<div><p>${item.split(`\r\n${bar}\r\n`)[1].replace(/\r\n/g, '</p><p>')}</p></div>`,
        };
    });

    ctx.state.data = {
        title: list[0].split('\r\n\r\n').pop(),
        link: currentUrl,
        item: items,
    };
};
