const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { category = 'arxiv/cs.CL' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'https://papers.cool';
    const currentUrl = new URL(category, rootUrl).href;
    const apiKimiUrl = new URL(`${category.split(/\//)[0]}/kimi/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    const pubDate = parseDate(
        $('p.info')
            .first()
            .text()
            .match(/(\d+\s\w+\s\d{4})/)[1],
        ['DD MMM YYYY', 'D MMM YYYY']
    );

    let items = $('div.panel')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const doi = item.prop('id');
            const enclosureUrl =
                item
                    .find('a.pdf-preview')
                    .prop('onclick')
                    .match(/'(http.*?)'/)?.[1] ?? undefined;

            return {
                title: item.find('span[id]').first().text(),
                link: item.find('a').first().prop('href'),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    summary: item.find('p.summary').text(),
                }),
                author: item
                    .find('p.authors a')
                    .toArray()
                    .map((a) => $(a).text())
                    .join('; '),
                guid: `${currentUrl}#${doi}`,
                pubDate,
                enclosure_url: enclosureUrl,
                enclosure_type: enclosureUrl ? 'application/pdf' : undefined,
                doi,
            };
        });

    items = await Promise.all(
        items.map(async (item) => {
            const kimiURL = new URL(item.doi, apiKimiUrl).href;

            const cache = await ctx.cache.get(kimiURL);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            try {
                const { data: detailResponse } = await got(kimiURL, {
                    timeout: {
                        request: 5000,
                    },
                });

                // Another cache with content by Kiwi Chat.

                item.guid = `${item.guid}?kiwi`;
                item.description += art(path.join(__dirname, 'templates/description.art'), {
                    kimi: detailResponse,
                });

                ctx.cache.set(kimiURL, JSON.stringify(item));
            } catch (e) {
                // no-empty
            }

            return Promise.resolve(item);
        })
    );

    const title = $('title').text();
    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.state.data = {
        item: items,
        title: title.split(/-/)[0].trim(),
        link: currentUrl,
        description: title,
        icon,
        logo: icon,
        subtitle: $('h1').first().text(),
    };
};
