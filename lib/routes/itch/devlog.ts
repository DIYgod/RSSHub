import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { isValidHost } from '@/utils/valid-host';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/devlog/:user/:id',
    categories: ['game'],
    example: '/itch/devlog/teamterrible/the-baby-in-yellow',
    parameters: { user: 'User id, can be found in URL', id: 'Item id, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Developer Logs',
    maintainers: ['nczitzk'],
    handler,
    description: `\`User id\` is the field before \`.itch.io\` in the URL of the corresponding page, e.g. the URL of [The Baby In Yellow Devlog](https://teamterrible.itch.io/the-baby-in-yellow/devlog) is \`https://teamterrible.itch.io/the-baby-in-yellow/devlog\`, where the field before \`.itch.io\` is \`teamterrible\`.

  \`Item id\` is the field between \`itch.io\` and \`/devlog\` in the URL of the corresponding page, e.g. the URL for [The Baby In Yellow Devlog](https://teamterrible.itch.io/the-baby-in-yellow/devlog) is \`https://teamterrible.itch.io/the-baby-in-yellow/devlog\`, where the field between \`itch.io\` and \`/devlog\` is \`the-baby-in-yellow\`.

  So the route is [\`/itch/devlogs/teamterrible/the-baby-in-yellow\`](https://rsshub.app/itch/devlogs/teamterrible/the-baby-in-yellow).`,
};

async function handler(ctx) {
    const user = ctx.req.param('user') ?? '';
    const id = ctx.req.param('id') ?? '';
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    if (!isValidHost(user)) {
        throw new InvalidParameterError('Invalid user');
    }

    const rootUrl = `https://${user}.itch.io/${id}/devlog`;

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = load(response.data);

    let items = $('.title')
        .toArray()
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: timezone(parseDate(item.text()), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const infoJson = content('script[type="application/ld+json"]:contains("@type":"BlogPosting")');
                const info = JSON.parse(content(infoJson).text());
                item.author = info.author.name;
                item.pubDate = info.datePublished;
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    images: content('.post_image')
                        .toArray()
                        .map((e) => content(e).attr('src')),
                    description: content('.post_body').html(),
                });

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
}
