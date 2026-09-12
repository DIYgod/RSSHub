import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

const baseUrl = 'https://www.namoc.cn';
const listUrl = `${baseUrl}/namoc/zhanlan/zl_list.shtml`;

export const route: Route = {
    path: '/zhanlan',
    categories: ['travel'],
    example: '/namoc/zhanlan',
    name: 'Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.namoc.cn/namoc/zhanlan/zl_list.shtml'],
            target: '/zhanlan',
        },
    ],
    handler: async (): Promise<Data> => {
        const museumName = namespace.zh?.name || namespace.name;

        const response = await ofetch(listUrl);
        const $ = load(response);

        const items = await Promise.all(
            $('ul.zllist#zlhglb > li.clearfix')
                .toArray()
                .map((el) => {
                    const $li = $(el);

                    const $titleAnchor = $li.find('div.text h3 > a');
                    const title = $titleAnchor.attr('title') || '';

                    const rawLink = $titleAnchor.attr('href') || '';
                    const link = new URL(rawLink, baseUrl).href;

                    const fullDuration = $li
                        .find('div.text div p')
                        .filter((_, p) => $(p).text().startsWith('展览时间：'))
                        .text()
                        .replace('展览时间：', '');

                    const location = $li
                        .find('div.text div p')
                        .filter((_, p) => $(p).text().startsWith('展览场地：'))
                        .text()
                        .replace('展览场地：', '');

                    // Parse startDate and endDate from "YYYY-MM-DD至YYYY-MM-DD"
                    const dateParts = fullDuration.split('至');
                    const startDate = dateParts[0] || undefined;
                    const endDate = dateParts[1] || undefined;

                    const scriptText = $li.find('p.image script').text();
                    const images = JSON.parse(scriptText.match(/var\s+jsonImageStr\s*=\s*'(\[.*?\])'/s)![1]) as Array<{ savepath: string }>;
                    const imgUrl = new URL(images[0].savepath, baseUrl).href;

                    return cache.tryGet(link, async (): Promise<DataItem> => {
                        // Fetch detail page for pubDate
                        const detailHtml = await ofetch(link);
                        const $detail = load(detailHtml);
                        const pubDateStr = $detail('meta[name="PubDate"]').attr('content') || '';
                        const pubDate = timezone(parseDate(pubDateStr), 8);

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
                })
        );

        return {
            title: `${museumName} - 展览`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
