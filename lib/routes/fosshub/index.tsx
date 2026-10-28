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

    const versionDetails = $('.stat').filter((_, element) => $(element).find('dt').text() === 'Latest version');
    const version = $('dd[itemprop="softwareVersion"]').first().text() || versionDetails.find('dd').first().text();
    if (!version) {
        throw new Error(`FossHub did not provide a software version for ${id}. The source page may have changed.`);
    }
    const released =
        $('.ma__upd .v').text() ||
        versionDetails
            .find('.rel')
            .text()
            .replace(/^Released\s+/, '');
    const downloads = $('.dwn-dl')
        .toArray()
        .map((link) =>
            $(link)
                .find('.w')
                .toArray()
                .map((entry) => ({
                    dt: $(entry).find('dt').text(),
                    dd: $(entry).find('dd').html(),
                }))
        );
    if (!downloads.length) {
        downloads.push(
            $('#downloads .dl-link')
                .toArray()
                .map((link) => ({
                    dt: $(link).find('.dl-label').text(),
                    dd: renderToString(<a href={new URL($(link).attr('href')!, currentUrl).href}>Visit download page</a>),
                }))
        );
    }
    const pubDate = released ? (/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(released) ? parseDate(`${released} +0000`, 'MMM D, YYYY ZZ') : parseDate(released, 'MMM D, YYYY')) : undefined;

    const items = [
        {
            title: version,
            link: `${currentUrl}#${version}`,
            description: renderDescription(downloads, $('[itemprop="releaseNotes"]').html()),
            pubDate,
        },
    ];

    return {
        title: `${$('#fh-ssd__hl').text()} - FossHub`,
        link: currentUrl,
        item: items,
    };
}
