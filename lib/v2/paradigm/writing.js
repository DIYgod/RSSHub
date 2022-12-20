const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://www.paradigm.xyz';

module.exports = async (ctx) => {
    const url = `${baseUrl}/writing`;

    const response = await got(url);
    const $ = cheerio.load(response.data);

    const nextData = JSON.parse($('#__NEXT_DATA__').text());
    const buildId = nextData.buildId;
    const list = nextData.props.pageProps.posts.map((item) => ({
        title: item.title,
        link: `${baseUrl}${item.slug}`,
        api: `${baseUrl}/_next/data/${buildId}${item.slug}.json`,
        author: item.authors.map((author) => author.name).join(', '),
        pubDate: parseDate(item.originalDate),
        category: item.tags,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.api);
                const $ = cheerio.load(response.data.pageProps.content, null, false);

                // Remove the TOC
                $('.toc').remove();
                item.description = $.html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Paradigm - Writing',
        link: url,
        item: items,
    };
};
