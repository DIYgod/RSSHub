import { type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

interface ExhibitionItem {
    exhibitionType: 'permanent' | 'special' | 'temporary';
    title: string;
    itemLink: string;
    imgUrl: string;
    location?: string;
    fullDuration?: string;
}

type ExhibitionConfig = {
    selector: string;
    type: 'permanent' | 'special' | 'temporary';
    extra: ($item: Cheerio<Element>) => Partial<Pick<ExhibitionItem, 'location' | 'fullDuration'>>;
};

// convert date string like "YYYY年M月D日" to "YYYY-MM-DD"
const formatStr = (dateStr: string | undefined): string | undefined => {
    if (!dateStr) {
        return undefined;
    }

    const match = dateStr.trim().match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/);

    if (match) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return undefined;
};

const extractDates = (durationStr?: string): { startDate?: string; endDate?: string } => {
    if (!durationStr || durationStr.includes('永久')) {
        return { startDate: undefined, endDate: undefined };
    }
    const parts = durationStr.split(/—/);

    return { startDate: formatStr(parts[0]), endDate: formatStr(parts[1]) };
};

const renderDescription = (imgUrl: string, location?: string, startDate?: string, endDate?: string, fullDuration?: string) =>
    renderToString(
        <div>
            {<img src={imgUrl} />}
            <br />
            <p>
                <b>地点：</b>
                {location ?? '参考展览详情或图片'}
            </p>
            <p>
                <b>开展：</b>
                {startDate ?? '参考展览详情或图片'}
            </p>
            <p>
                <b>闭展：</b>
                {endDate ?? '参考展览详情或图片'}
            </p>
            {fullDuration && (
                <p>
                    <small>原始展期：{fullDuration}</small>
                </p>
            )}
        </div>
    );

export const route: Route = {
    path: '/current-exhibitions/:type?',
    categories: ['travel'],
    example: '/hnmuseum/current-exhibitions/special',
    parameters: {
        type: 'Exhibition type, supported values: special（临时展览 special+temporary）. Default: All exhibitions.',
    },
    name: 'Current Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.hnmuseum.com/zh-hans/content/当前展览－基本陈列'],
            target: '/current-exhibitions',
        },
    ],

    handler: async (ctx) => {
        const typeParam = ctx.req.param('type');
        const isSpecial = typeParam === 'special';

        const baseUrl = 'https://www.hnmuseum.com';
        const listUrl = `${baseUrl}/zh-hans/content/当前展览－基本陈列`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got({
            method: 'get',
            url: listUrl,
        });

        const $ = load(response.data);

        const exhibitionConfigs: ExhibitionConfig[] = [
            {
                selector: '#block-views-a784821b4fd9f41563c7164fd2a2f96e .views-row',
                type: 'permanent' as const,
                extra: ($item: Cheerio<Element>) => ({
                    location: $item.find('.views_zhanting .field-content').text().trim(),
                    fullDuration: $item.find('.views_startdate .field-content').text().trim(),
                }),
            },
            {
                selector: '#block-views-chen-lie-block .views-row',
                type: 'special' as const,
                extra: ($item: Cheerio<Element>) => ({
                    location: $item.find('.views_zhanting .field-content').text().trim(),
                }),
            },
            {
                selector: '#block-views-zhan-lan-block .views-row',
                type: 'temporary' as const,
                extra: (_$item: Cheerio<Element>) => ({}),
            },
        ];

        // use flatMap to avoid pushing into an external array, making the code cleaner and more functional
        const list = exhibitionConfigs.flatMap((config) =>
            $(config.selector)
                .toArray()
                .map((item) => {
                    const $item = $(item);
                    const $a = $item.find('.views_title a, .views_img_bg a').first();
                    const link = $a.attr('href') || '';

                    return {
                        exhibitionType: config.type,
                        title: $a.text(),
                        itemLink: link.startsWith('http') ? link : `${baseUrl}${link}`,
                        imgUrl: $item.find('img').attr('src') || '',
                        ...config.extra($item as Cheerio<Element>),
                    };
                })
        );

        const targetList = isSpecial ? list.filter((item) => item.exhibitionType === 'special' || item.exhibitionType === 'temporary') : list;

        const items = await Promise.all(
            targetList.map((item) => {
                const cacheKey = item.itemLink;

                return cache.tryGet(cacheKey, async (): Promise<DataItem> => {
                    if (item.exhibitionType === 'permanent' || item.exhibitionType === 'special') {
                        const { startDate, endDate } = extractDates(item.fullDuration);
                        return {
                            title: item.title,
                            link: item.itemLink,
                            pubDate: startDate ? parseDate(startDate) : undefined,
                            description: renderDescription(item.imgUrl, item.location, startDate, endDate, item.fullDuration),
                            _extra: { museumName, location: item.location, startDate, endDate },
                        };
                    }

                    const url = new URL(item.itemLink);
                    // for theme exhibition, the detail page may be a SPA, so need to fetch the JS file to extract the data
                    if (url.hostname === 'vrexhibition.hnmuseum.com') {
                        const htmlRes = await got({ method: 'get', url: item.itemLink });
                        const $spa = load(htmlRes.data);
                        const jsSrc = $spa('script[type="module"][src]').attr('src') || '';
                        const jsUrl = new URL(jsSrc, item.itemLink).href;
                        const jsRes = await got({ method: 'get', url: jsUrl });
                        const jsContent = jsRes.data;
                        const titleMatch = jsContent.match(/"title"[^)]*\)\s*\},[^"]*"([^"]+)"/);
                        const title = titleMatch?.[1];
                        const dateMatch = jsContent.match(/"(\d{4}年\d{1,2}月\d{1,2}日—\d{4}年\d{1,2}月\d{1,2}日)"/);
                        const fullDuration = dateMatch?.[1];
                        const locMatch = jsContent.match(/"(湖南省博物馆[^"]+厅)"/);
                        const location = locMatch?.[1];
                        const { startDate, endDate } = extractDates(fullDuration);

                        return {
                            title,
                            link: item.itemLink,
                            pubDate: startDate ? parseDate(startDate) : undefined,
                            description: renderDescription(item.imgUrl, location, startDate, endDate, fullDuration),
                            _extra: { museumName, location, startDate, endDate },
                        };
                    }

                    const detailResponse = await got({ method: 'get', url: item.itemLink });
                    const content = load(detailResponse.data);
                    const title = content('h1#page-title').text();
                    return {
                        title,
                        link: item.itemLink,
                        description: renderDescription(item.imgUrl),
                        _extra: { museumName },
                    };
                }) as Promise<DataItem>;
            })
        );

        return {
            title: `${museumName} - 当前展览${isSpecial ? ' - 专题&临时展览' : ''}`,
            link: listUrl,
            language: 'zh-CN',
            item: items.filter((item) => item.title && Object.keys(item).length > 0) as DataItem[],
        };
    },
};
