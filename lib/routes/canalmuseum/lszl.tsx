import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

// Converts "YYYY年M月D日" to "YYYY-MM-DD"
const formatExhibitionDate = (dateStr: string): string | undefined => {
    const m = dateStr.trim().match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
    return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : undefined;
};

// Parses "YYYY年M月D日—YYYY年M月D日"
const parseExhibitionDuration = (fullDuration: string) => {
    const [startRaw, endRaw] = fullDuration.split('—', 2);
    return { startDate: formatExhibitionDate(startRaw), endDate: formatExhibitionDate(endRaw) };
};

export const route: Route = {
    path: '/lszl',
    categories: ['travel'],
    example: '/canalmuseum/lszl',
    radar: [
        {
            source: ['www.canalmuseum.org.cn/lszl.html'],
            target: '/lszl',
        },
    ],
    name: '临时展览',
    maintainers: ['magazian'],
    handler: async () => {
        const museumName = namespace.zh?.name || namespace.name;
        const baseUrl = 'https://www.canalmuseum.org.cn';
        const listUrl = `${baseUrl}/lszl.html`;
        const response = await ofetch(listUrl);
        const $ = load(response);

        const items = $('.exhibition2 .list .item')
            .toArray()
            .map((el) => {
                const $el = $(el);

                const imgUrl = $el.find('.image img').attr('src');
                const $textA = $el.find('.text > a');
                const title = $textA.find('.title1 .t1').text();
                const href = $textA.attr('href') ?? '';
                const link = new URL(href, baseUrl).href;

                const liItems = $textA
                    .find('.ul .li')
                    .toArray()
                    .map((li) => $(li).text());
                const fullDuration = liItems.find((t) => t.startsWith('时间：'))?.replace('时间：', '') ?? '';
                const location = liItems.find((t) => t.startsWith('地点：'))?.replace('地点：', '') ?? '';

                const { startDate, endDate } = parseExhibitionDuration(fullDuration);
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
                    pubDate,
                    description,
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
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
