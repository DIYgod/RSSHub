import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/index/:productID',
    categories: ['program-update'],
    example: '/ipsw.dev/index/iPhone16,1',
    parameters: {
        productID: 'Product ID',
    },
    name: 'Apple latest beta firmware',
    maintainers: ['RieN7'],
    handler,
};

async function handler(ctx) {
    const { productID } = ctx.req.param();
    const link = `https://ipsw.dev/${productID}`;

    const resp = await got({
        method: 'get',
        url: link,
    });

    const $ = load(resp.data);

    const productName = $('#identifier_info_content .font-semibold').first().text() || productID;

    const builds = new Set<string>();
    const list = $('.firmware')
        .toArray()
        .map((element): DataItem | undefined => {
            const ele = $(element);
            const version = ele.find('.versions-info > div').first().text();
            const build = ele.find('.build-id').text();
            if (!build) {
                throw new Error('IPSW.dev did not provide a firmware build identifier.');
            }
            if (builds.has(build)) {
                return undefined;
            }
            builds.add(build);
            const date = ele.find('td:nth-child(3)').text();
            const size = ele.find('td:nth-child(4)').text();
            return {
                title: `${productName} - ${version}`,
                link: `https://ipsw.dev/download/${productID}/${build}`,
                pubDate: date ? timezone(parseDate(date, 'MMMM D, YYYY'), 0) : undefined,
                guid: build,
                description: renderToString(
                    <table>
                        <tbody>
                            <tr>
                                <th>Version</th>
                                <td>{version}</td>
                            </tr>
                            <tr>
                                <th>Build</th>
                                <td>{build}</td>
                            </tr>
                            <tr>
                                <th>Released</th>
                                <td>{date}</td>
                            </tr>
                            <tr>
                                <th>Size</th>
                                <td>{size}</td>
                            </tr>
                        </tbody>
                    </table>
                ),
            };
        })
        .filter((item): item is DataItem => item !== undefined);

    return {
        title: `${productName} Released`,
        link,
        item: list,
    };
}
