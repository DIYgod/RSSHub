import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { parseDateRange } from '@/utils/parse-date-range';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

const typeMap = new Map<string, { sortId: string; name: string }>([
    ['basic', { sortId: '2', name: '基本陈列' }],
    ['temporary', { sortId: '3', name: '临时陈列' }],
    ['export', { sortId: '29', name: '输出陈列' }],
    ['import', { sortId: '30', name: '引进陈列' }],
    ['exchange', { sortId: '27', name: '展览交流' }],
]);

export const route: Route = {
    path: '/exhibition/:type?',
    categories: ['travel'],
    example: '/lvshunmuseum/exhibition/temporary',
    parameters: {
        type: 'Exhibition type, supported values: all（陈列展览）、basic（基本陈列）、temporary（临时陈列）、export（输出陈列）、import（引进陈列）、exchange（展览交流）. Default: all（all exhibitions）.',
    },
    name: 'Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['lvshunmuseum.cn/Exhibition/'],
            target: '/exhibition',
        },
    ],
    handler: async (ctx) => {
        const baseUrl = 'https://lvshunmuseum.cn';

        // Pages label the fields inconsistently: 展览时间 / 地点 and 展出时间 / 地点 (at basic page)
        const durationPattern = /^展[览出]时间：\s*/;
        const locationPattern = /^展[览出]地点：\s*/;

        const fetchList = async (sortId: string) => {
            const response = await ofetch(`${baseUrl}/Exhibition/?SortID=${sortId}`);
            const $ = load(response);

            return $('ul.showcase_list > li')
                .toArray()
                .map((el) => {
                    const $item = $(el);
                    const link = new URL($item.find('a').attr('href')!, baseUrl).href;
                    const lines = $item
                        .find('.textbox > p')
                        .toArray()
                        .flatMap((p) => $(p).text().split('\n'))
                        .map((line) => line);
                    const textOf = (pattern: RegExp) => {
                        const line = lines.find((l) => pattern.test(l));
                        return line?.replace(pattern, '') || undefined;
                    };
                    const imgSrc = $item.find('.picbox img').attr('src');

                    return {
                        title: $item.find('.textbox > h1').text(),
                        link,
                        imgUrl: imgSrc,
                        fullDuration: textOf(durationPattern),
                        location: textOf(locationPattern),
                    };
                });
        };

        const type = ctx.req.param('type') || 'all';
        const typeInfo = type === 'all' ? undefined : typeMap.get(type);
        if (type !== 'all' && !typeInfo) {
            throw new InvalidParameterError();
        }
        const sortIds = typeInfo
            ? [typeInfo.sortId]
            : typeMap
                  .values()
                  .toArray()
                  .map((value) => value.sortId);
        const listUrl = typeInfo ? `${baseUrl}/Exhibition/?SortID=${typeInfo.sortId}` : `${baseUrl}/Exhibition/`;
        const museumName = namespace.zh?.name || namespace.name;

        const pages = await Promise.all(sortIds.map((sortId) => fetchList(sortId)));
        const list = pages.flat();

        const items: DataItem[] = list.map((item) => {
            const { title, link, imgUrl, fullDuration, location } = item;

            const { startDate, endDate } = parseDateRange(fullDuration);
            const pubDate = startDate ? timezone(parseDate(startDate), 8) : undefined;

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
            title: `${museumName} - ${typeInfo?.name ?? '陈列展览'}`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        } as Data;
    },
};
