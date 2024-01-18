const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 50;

    const rootUrl = 'https://aqara.com';
    const apiSlug = 'wp-json/wp/v2';

    let filterName;

    let currentUrl = rootUrl;
    let apiUrl = new URL(`${apiSlug}/posts?_embed=true&per_page=${limit}`, rootUrl).href;

    const filterMatches = ctx.path.match(/^\/([^/]*)\/([^/]*)\/(.*)$/);

    if (filterMatches) {
        const filterRegion = filterMatches[1];
        const filterType = filterMatches[2] === 'tag' ? 'tags' : filterMatches[2] === 'category' ? 'categories' : filterMatches[2];
        const filterKeyword = decodeURI(filterMatches[3].split('/').pop());
        const filterApiUrl = new URL(`${filterRegion}/${apiSlug}/${filterType}?search=${filterKeyword}`, rootUrl).href;

        const { data: filterResponse } = await got(filterApiUrl);

        const filter = filterResponse.pop();

        if (filter?.id ?? undefined) {
            filterName = filter.name ?? filterKeyword;
            currentUrl = filter.link ?? currentUrl;
            apiUrl = new URL(`${filterRegion}/${apiSlug}/posts?_embed=true&per_page=${limit}&${filterType}=${filter.id}`, rootUrl).href;
        }
    }

    const { data: response } = await got(apiUrl);

    const items = response.slice(0, limit).map((item) => {
        const terminologies = item._embedded['wp:term'];

        const content = cheerio.load(item.content?.rendered ?? item.content);

        // To handle lazy-loaded images.

        content('figure').each(function () {
            const image = content(this).find('img');
            const src = (image.prop('data-actualsrc') ?? image.prop('data-original') ?? image.prop('src')).replace(/(-\d+x\d+)/, '');
            const width = image.prop('data-rawwidth') ?? image.prop('width');
            const height = image.prop('data-rawheight') ?? image.prop('height');

            content(this).replaceWith(
                art(path.join(__dirname, 'templates/figure.art'), {
                    src,
                    width,
                    height,
                })
            );
        });

        return {
            title: item.title?.rendered ?? item.title,
            link: item.link,
            description: content.html(),
            author: item._embedded.author.map((a) => a.name).join('/'),
            category: terminologies.flat().map((c) => c.name),
            guid: item.guid?.rendered ?? item.guid,
            pubDate: parseDate(item.date_gmt),
            updated: parseDate(item.modified_gmt),
        };
    });

    const { data: currentResponse } = await got(currentUrl);

    const $ = cheerio.load(currentResponse);

    const icon = $('link[rel="apple-touch-icon"]').first().prop('href');
    const title = $('meta[property="og:site_name"]').prop('content') ?? 'Aqara';

    ctx.state.data = {
        item: items,
        title: `${title}${filterName ? ` - ${filterName}` : ''}`,
        link: currentUrl,
        description: $('meta[property="og:title"]').prop('content'),
        language: $('meta[property="og:locale"]').prop('content'),
        image: $('meta[name="msapplication-TileImage"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('meta[property="og:type"]').prop('content'),
        author: title,
    };
};
