const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 50;

    const rootUrl = 'https://rawkuma.com';
    const currentUrl = new URL(`/manga/${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    const author = $('div.fmed span').eq(1).text().trim();
    const category = $('div.wd-full span.mgen a[rel="tag"]')
        .toArray()
        .map((c) => $(c).text());

    let items = $('div.eph-num')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('span.chapternum').text(),
                link: item.find('a').prop('href'),
                author,
                category,
                pubDate: parseDate(item.find('span.chapterdate').text(), 'MMMM DD'),
                enclosure_url: item.next().find('a.dload').prop('href'),
                enclosure_type: 'application/zip',
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                const imageMatches = detailResponse.match(/"images":(\[.*?])}],"lazyload"/);

                const images = imageMatches ? JSON.parse(imageMatches[1]) : [];

                item.title = content('div.chpnw').text().trim();
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    images,
                });
                item.author = author;
                item.category = category;
                item.pubDate = parseDate(content('time.entry-date').prop('datetime').replace(/WIB/, 'T'));
                item.enclosure_url = content('span.dlx a').prop('href');
                item.enclosure_type = 'application/zip';

                return item;
            })
        )
    );

    const icon = $('link[rel="apple-touch-icon"]')
        .prop('href')
        .replace(/-\d+x\d+/, '');

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('div[itemprop="description"]').text(),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('div.wd-full span').text(),
        author,
    };
};
