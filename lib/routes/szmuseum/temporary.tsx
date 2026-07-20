import tls from 'node:tls';

import { load } from 'cheerio';
import dayjs from 'dayjs';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

export const route: Route = {
    path: '/temporary',
    categories: ['travel'],
    example: '/szmuseum/temporary',
    name: 'Special Exhibition',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.szmuseum.com/Exhibition/Temporary'],
            target: '/temporary',
        },
    ],
    handler: async () => {
        const baseUrl = 'https://www.szmuseum.com';
        const apiUrl = `${baseUrl}/Exhibition/Temporary`;
        const museumName = namespace.zh?.name || namespace.name;

        // Bypass Node.js's native fetch strict HTTP header validation. The target server returns a non-compliant
        // `Cache-Control: no-cache ` header with a trailing space, which causes `fetch` and `got` to fail.
        const content = await new Promise<string>((resolve, reject) => {
            const socket = tls.connect(
                443,
                'www.szmuseum.com',
                {
                    servername: 'www.szmuseum.com',
                },
                () => {
                    socket.write('GET /Exhibition/Temporary HTTP/1.1\r\nHost: www.szmuseum.com\r\nConnection: close\r\n\r\n');
                }
            );
            let data = Buffer.from([]);
            socket.on('data', (chunk) => {
                data = Buffer.concat([data, Buffer.from(chunk)]);
            });
            socket.on('end', () => {
                const str = data.toString('utf-8');
                const bodyIndex = str.indexOf('\r\n\r\n');
                resolve(str.slice(bodyIndex + 4));
            });
            socket.on('error', reject);
        });

        const $ = load(content);

        const list = $('.extemwrap ul li.clearfix')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('h1 a');
                const title = a.text();
                const link = new URL(a.attr('href') || '', baseUrl).href;
                const imgUrl = new URL($item.find('.aleftimg img').attr('src') || '', baseUrl).href;

                const fullDuration = $item.find('.activity_r_detail p:nth-child(1) span:nth-child(2)').text().trim();
                const location = $item.find('.activity_r_detail p:nth-child(2) span:nth-child(2)').text().trim();

                let startDate;
                let endDate;

                if (fullDuration) {
                    const times = fullDuration.split('-');
                    const startStr = times[0]
                        .replaceAll(/（.*?）/g, '')
                        .trim()
                        .replaceAll(/[年月/.]/g, '-')
                        .replace('日', '');
                    let endStr = times[1]
                        .replaceAll(/（.*?）/g, '')
                        .trim()
                        .replaceAll(/[年月/.]/g, '-')
                        .replace('日', '');

                    if (startStr && endStr.split('-').length === 2) {
                        endStr = `${startStr.split('-', 1)[0]}-${endStr}`;
                    }

                    startDate = dayjs(startStr).format('YYYY-MM-DD');
                    endDate = dayjs(endStr).format('YYYY-MM-DD');
                }

                const pubDate = startDate ? parseDate(startDate) : undefined;

                const description = renderToString(
                    <div>
                        <img src={imgUrl} />
                        <br />
                        <p>
                            <b>地点：</b>
                            {location || '参考详情'}
                        </p>
                        <p>
                            <b>开展：</b>
                            {startDate || '未定/常设'}
                        </p>
                        <p>
                            <b>闭展：</b>
                            {endDate || '未定/常设'}
                        </p>
                        {fullDuration && (
                            <p>
                                <small>原始展期：{fullDuration}</small>
                            </p>
                        )}
                    </div>
                );

                return {
                    title,
                    link,
                    description,
                    pubDate,
                    _extra: {
                        museumName,
                        location,
                        startDate,
                        endDate,
                    },
                };
            });

        return {
            title: `${museumName} - 临时展览`,
            link: apiUrl,
            language: 'zh-CN',
            item: list,
        };
    },
};
