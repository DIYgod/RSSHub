import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { parseDateRange } from '@/utils/parse-date-range';

import { namespace } from './namespace';

export const route: Route = {
    path: '/list/:type?',
    categories: ['travel'],
    example: '/hebeimuseum/list/special',
    parameters: {
        type: 'Exhibition type, supported values: special（临时展览详情）. Default: All.',
    },
    name: 'Temporary Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.hebeimuseum.org.cn/list-26-1.html'],
            target: '/list',
        },
    ],

    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const isSpecial = type === 'special';

        const baseUrl = 'https://www.hebeimuseum.org.cn';
        const apiUrl = `${baseUrl}/list-26-1.html`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got({
            method: 'get',
            url: apiUrl,
        });

        const $ = load(response.data);

        const list = $('.main1wrap ul.list li a')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const link = $item.attr('href');
                const imgUrlRaw = $item.find('figure img').attr('src');
                const listTitle = $item.find('p.name').text();

                return {
                    title: listTitle,
                    itemLink: `${baseUrl}${link}`,
                    imgUrl: imgUrlRaw,
                };
            });

        const items = await Promise.all(
            list.map((item) => {
                // use seperate cache key for special path
                const cacheKey = isSpecial ? `${item.itemLink}-special` : item.itemLink;

                return cache.tryGet(cacheKey, async (): Promise<Partial<DataItem>> => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.itemLink,
                    });
                    const content = load(detailResponse.data);

                    const pubDateRaw = content('.article .info .infowrap img.icon_time').next('span').text().replaceAll('时间：', '');
                    const pubDate = parseDate(pubDateRaw);

                    // Default path: return as news, no detail information for return
                    if (!isSpecial) {
                        return {
                            title: item.title,
                            link: item.itemLink,
                            pubDate,
                            description: renderToString(
                                <div>
                                    <img src={item.imgUrl} />
                                </div>
                            ),
                        };
                    }

                    // Special path to return detail exhibition information
                    let rawText = content('.content.f16').text(); // get descption text from detail page

                    rawText = rawText.replaceAll(/\s+/g, '');

                    const texts = rawText.split(/(?=展览名称：|展览时间：|时间：|展览地点：|展出地点：|地点：)/);

                    // use fullDration to extract startDate and endDate, if fullDuration is not exist, return empty data
                    const fullDuration = texts.find((text) => text.includes('时间：'))?.replaceAll(/(?:展览)?时间：/g, '');

                    if (!fullDuration) {
                        return {};
                    }

                    let location = texts.find((text) => text.includes('地点：'))?.replaceAll(/(?:展(?:览|出))?地点：/g, '') || '';

                    const locMatch = location.match(/^.*?厅/) || [''];

                    location = locMatch[0];

                    let title = texts.find((text) => text.includes('展览名称：'))?.replaceAll('展览名称：', '');

                    // Some exhibition titles are not in the format of "展览名称: xxx", try to extract title from the original list title if the above method failed
                    if (!title) {
                        // try get the title between “” or 《》, if not exist, get the text after '|' in the original list title
                        const quoteMatch = item.title.match(/[“《](.*?)[”》]/);

                        if (quoteMatch) {
                            title = quoteMatch[1];
                        } else if (item.title.includes('|')) {
                            const pipeParts = item.title.split('|');
                            title = pipeParts.at(-1);
                        }
                    }

                    const { startDate, endDate } = parseDateRange(fullDuration);
                    const { imgUrl, itemLink } = item;

                    const description = renderToString(
                        <div>
                            <img src={imgUrl} />
                            <br />
                            <p>
                                <b>地点：</b>
                                {location}
                            </p>
                            <p>
                                <b>开展：</b>
                                {startDate ?? '未定/常设'}
                            </p>
                            <p>
                                <b>闭展：</b>
                                {endDate ?? '未定/常设'}
                            </p>
                            <p>
                                <small>原始展期：{fullDuration}</small>
                            </p>
                        </div>
                    );

                    return {
                        title,
                        link: itemLink,
                        pubDate,
                        description,
                        _extra: {
                            museumName,
                            title,
                            location,
                            startDate,
                            endDate,
                            itemLink,
                        },
                    };
                });
            })
        );

        return {
            title: `${museumName} - 临时展览${isSpecial ? ' - 特展详情' : ''}`,
            link: apiUrl,
            language: 'zh-CN',
            item: items.filter((item): item is DataItem => Boolean(item.title)),
        };
    },
};
