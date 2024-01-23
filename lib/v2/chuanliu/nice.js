const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const md = require('markdown-it')({
    html: true,
});

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 100;

    const rootUrl = 'https://chuanliu.org';
    const apiRootUrl = 'https://s.chuanliu.org';
    const currentUrl = new URL('nice/', rootUrl).href;
    const apiUrl = new URL('api/dis/api/v1/memo', apiRootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            creatorId: 1,
            offset: 0,
            limit,
        },
    });

    const items = response.slice(0, limit).map((item) => {
        const contents = item.content.split(/\n/);

        const category = contents?.[0].replace(/^#/, '') ?? undefined;
        const title = contents?.[1] ?? undefined;
        const link = contents?.[2] ?? undefined;
        const author = contents?.[3] ?? undefined;
        const isStar = (contents?.[5] && contents[5] === 'star') ?? false;

        if (isStar) {
            contents.splice(5, 1);
        }

        return {
            title: `${isStar ? '[STAR] ' : ''}${title}`,
            link,
            description: art(path.join(__dirname, 'templates/description.art'), {
                description: md.render(contents?.join('\n\n') ?? ''),
                images: item.resourceList.map((i) => ({
                    src: i.externalLink,
                    alt: i.filename,
                    type: i.type,
                })),
            }),
            author,
            category: [category, isStar ? 'STAR' : undefined].filter(Boolean),
            guid: `chuanliu-nice#${item.id}`,
            pubDate: parseDate(item.createdTs, 'X'),
            updated: parseDate(item.updatedTs, 'X'),
        };
    });

    const { data: currentResponse } = await got(currentUrl);

    const $ = cheerio.load(currentResponse);

    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), currentUrl).href;

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('span.rainbow-text').first().text(),
        language: $('html').prop('lang'),
        icon,
        logo: icon,
        subtitle: $('title').text(),
        author: $('meta[name="author"]').prop('content'),
        allowEmpty: true,
    };
};
