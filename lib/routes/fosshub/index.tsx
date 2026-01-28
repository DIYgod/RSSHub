import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const renderDescription = (links, changelog) =>
    renderToString(
        <>
            <table>
                <tbody>
                    {links?.map((link) => (
                        <>
                            <tr>
                                {link.map((item) => (
                                    <th>{item.dt}</th>
                                ))}
                            </tr>
                            <tr>
                                {link.map((item) => (
                                    <td>{item.dd ? raw(item.dd) : null}</td>
                                ))}
                            </tr>
                        </>
                    ))}
                </tbody>
            </table>
            {changelog ? (
                <>
                    <br />
                    {raw(changelog)}
                </>
            ) : null}
        </>
    );

export const route: Route = {
    path: '/:id',
    categories: ['program-update'],
    example: '/fosshub/qBittorrent',
    parameters: { id: 'Software id, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Software Update',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '';

    const rootUrl = 'https://www.fosshub.com';
    const currentUrl = `${rootUrl}/${id}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const version = $('dd[itemprop="softwareVersion"]').first().text();

    const items = [
        {
            title: version,
            link: `${currentUrl}#${version}`,
            description: renderDescription(
                $('.dwn-dl')
                    .toArray()
                    .map((l) =>
                        $(l)
                            .find('.w')
                            .toArray()
                            .map((w) => ({
                                dt: $(w).find('dt').text(),
                                dd: $(w).find('dd').html(),
                            }))
                    ),
                $('div[itemprop="releaseNotes"]').html()
            ),
            pubDate: parseDate($('.ma__upd .v').text(), 'MMM DD, YYYY'),
        },
    ];

    return {
        title: `${$('#fh-ssd__hl').text()} - FossHub`,
        link: currentUrl,
        item: items,
    };
}
