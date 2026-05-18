import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const renderTitle = ({ line, latency, loss, speed, node, ip }) =>
    renderToString(
        <>
            [{line} | {latency} | {loss} | {speed} | {node}] {ip}
        </>
    );

const renderDescription = ({ line, latency, loss, speed, node, ip }) =>
    renderToString(
        <table>
            <tbody>
                <tr>
                    <th>Line</th>
                    <td>{line}</td>
                </tr>
                <tr>
                    <th>Latency</th>
                    <td>{latency}</td>
                </tr>
                <tr>
                    <th>Loss</th>
                    <td>{loss}</td>
                </tr>
                <tr>
                    <th>Speed</th>
                    <td>{speed}</td>
                </tr>
                <tr>
                    <th>Node</th>
                    <td>{node}</td>
                </tr>
                <tr>
                    <th>IP</th>
                    <td>{ip}</td>
                </tr>
            </tbody>
        </table>
    );

const lines = {
    CM: '中国移动',
    CU: '中国联通',
    CT: '中国电信',
};

export const route: Route = {
    path: '/cloudflareyes/:type?',
    categories: ['other'],
    example: '/hostmonit/cloudflareyes',
    parameters: { type: '类型，见下表，默认为 v4' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'CloudFlareYes',
    maintainers: ['nczitzk'],
    handler,
    description: `| v4 | v6 |
| -- | -- |
|    | v6 |`,
};

async function handler(ctx) {
    const { type = 'v4' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const domain = 'hostmonit.com';
    const title = `CloudFlareYes${type === 'v6' ? type.toUpperCase() : ''}`;

    const rootUrl = `https://stock.${domain}`;
    const rootApiUrl = `https://api.${domain}`;
    const apiUrl = new URL('get_optimization_ip', rootApiUrl).href;
    const currentUrl = new URL(title, rootUrl).href;

    const key = 'iDetkOys';

    const { data: response } = await got.post(apiUrl, {
        json: {
            key,
            ...(type === 'v6'
                ? {
                      type: 'v6',
                  }
                : {}),
        },
    });

    const items = response.info.slice(0, limit).map((item) => {
        const ip = item.ip;
        const latency = item.latency === undefined ? undefined : `${item.latency}ms`;
        const line = item.line === undefined ? undefined : Object.hasOwn(lines, item.line) ? lines[item.line] : item.line;
        const loss = item.loss === undefined ? undefined : `${item.loss}%`;
        const node = item.node;
        const speed = item.speed === undefined ? undefined : `${item.speed} KB/s`;
        const pubDate = timezone(parseDate(item.time), +8);

        return {
            title: renderTitle({
                line,
                latency,
                loss,
                speed,
                node,
                ip,
            }),
            link: currentUrl,
            description: renderDescription({
                line,
                node,
                ip,
                latency,
                loss,
                speed,
            }),
            author: node,
            category: [line, latency, loss, node].filter(Boolean),
            guid: `${domain}-${title}-${ip}#${pubDate.toISOString()}`,
            pubDate,
        };
    });

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: $('title').text().replace(/- .*$/, `- ${title}`),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        icon,
        logo: icon,
        subtitle: title,
        author: $('title').text().split(/\s-/)[0],
        allowEmpty: true,
    };
}
