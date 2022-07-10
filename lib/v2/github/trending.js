const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const since = ctx.params.since;
    const language = ctx.params.language === 'any' ? '' : ctx.params.language;
    const spoken_language = ctx.params.spoken_language ?? '';
    const url = `https://github.com/trending/${encodeURIComponent(language)}?since=${since}&spoken_language_code=${spoken_language}`;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: url,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('article');

    const items = await Promise.all(
        list.map((_, item) => {
            item = $(item);
            const endpoint = item.find('h1 a').attr('href');
            const link = `https://github.com${endpoint}`;
            return ctx.cache.tryGet(`github:trending:${endpoint}`, async () => {
                const response = await got({
                    method: 'get',
                    url: link,
                });

                const $ = cheerio.load(response.data);
                const cover = $('meta[property="og:image"]');

                const single = {
                    title: item.find('h1').text(),
                    author: item.find('h1').text().split('/')[0].trim(),
                    description: `<img src="${cover.attr('content')}">
                        <br>${item.find('p').text()}<br>
                        <br>Language: ${item.find('span[itemprop="programmingLanguage"]').text() || 'Unknown'}
                        <br>Star: ${item.find('.Link--muted').eq(0).text().trim()}
                        <br>Fork: ${item.find('.Link--muted').eq(1).text().trim()}`,
                    link,
                };

                return single;
            });
        })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: items,
    };
};
