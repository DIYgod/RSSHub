const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const channel = ctx.params.channel ?? 'shouye';
    const currentUrl = `https://huacheng.gz-cmc.com/channel/${channel}/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const title = $('a.brand').text().trim();
    let items = $('.news-list-row2')
        .toArray()
        .filter((item) => $(item).attr('contenttype') === '1' && $(item).attr('mlistpattern') === '1')
        .map((item) => {
            item = $(item);
            return {
                title: item.text().replace(/\s*/g, ''),
                link: item.children('a').attr('href'),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    thumb: item.find('img').attr('src'),
                }),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);
                content('.broadcast-container').remove();

                item.description += content('.article-source').html() ?? '';
                item.description += content('#articleContent').html();
                item.title = content('title').text();
                item.author = content('meta[name="author"]').attr('content');
                item.pubDate = timezone(parseDate(content('.article-time').text()), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `广州日报新花城 - ${title}`,
        link: currentUrl,
        item: items,
    };
};
