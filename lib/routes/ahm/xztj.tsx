import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { parseDateRange } from '@/utils/parse-date-range';

import { fetchPage } from './ct2-waap';
import { namespace } from './namespace';

const baseUrl = 'https://www.ahm.cn';

export const route: Route = {
    path: '/exhibition/xztj',
    categories: ['travel'],
    example: '/ahm/exhibition/xztj',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.ahm.cn/Exhibition/TListNow/xztj'],
            target: '/exhibition/xztj',
        },
    ],
    name: 'Special Exhibition',
    maintainers: ['magazian'],
    handler: async () => {
        const museumName = namespace.zh?.name || namespace.name;
        const listUrl = `${baseUrl}/Exhibition/TListNow/xztj`;

        const html = await fetchPage(listUrl);
        const $ = load(html);

        const items: DataItem[] = $('ul.exhibition-new li')
            .toArray()
            .map((el) => {
                const $el = $(el);

                const onclickAttr = $el.find('a[onclick]').attr('onclick') ?? '';
                const onclickMatch = onclickAttr.match(/f_visitCount\('(\d+)','([^']+)','([^']+)'\)/);
                if (!onclickMatch) {
                    return;
                }

                const exhibitionId = onclickMatch[1];
                const link = onclickMatch[2];

                const title = $el.find('.cont h3').text();
                const imgUrl = $el.find('img').attr('src') ?? '';

                const durationText =
                    $el
                        .find('p')
                        .toArray()
                        .map((p) => $(p).text())
                        .find((t) => t.startsWith('展出时间：')) ?? '';

                const locationText =
                    $el
                        .find('p')
                        .toArray()
                        .map((p) => $(p).text())
                        .find((t) => t.startsWith('展出地点：')) ?? '';

                const location = locationText.replace('展出地点：', '');
                const fullDuration = durationText.replace('展出时间：', '');

                const { startDate, endDate } = parseDateRange(fullDuration);

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

                const guid = `${baseUrl}/Exhibition/Details/xztj?nid=${exhibitionId}`;

                return {
                    title,
                    link,
                    guid,
                    pubDate,
                    description,
                    _extra: {
                        museumName,
                        location,
                        startDate,
                        endDate,
                    },
                };
            })
            .filter((item) => item !== undefined);

        return {
            title: `${museumName} - 新展推介`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
