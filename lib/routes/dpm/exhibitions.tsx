import { load } from 'cheerio';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

const TYPE_MAP = {
    temporary_exhibitions: { cid: '1', name: '特展' },
    galleries: { cid: '246', name: '专馆' },
    longterm_exhibitions: { cid: '10', name: '常设展览' },
    period_halls: { cid: '163', name: '原状陈列' },
};

export const route: Route = {
    path: '/exhibitions/:type?',
    categories: ['travel'],
    example: '/dpm/exhibitions/temporary_exhibitions',
    parameters: {
        type: 'Exhibition type, supported values: temporary_exhibitions（特展）、galleries（专馆）、longterm_exhibitions（常设展览）、period_halls（原状陈列）. Default: Current Exhibitions.',
    },
    // Use dpm English version channel name
    name: 'Current Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.dpm.org.cn/classify/exhibition.html'],
            target: '/exhibitions',
        },
    ],
    handler: async (ctx: Context): Promise<Data> => {
        const baseUrl = 'https://www.dpm.org.cn';
        const apiUrl = `${baseUrl}/searchs/exhibition.html`;

        const typeParam = ctx.req.param('type');

        const currentType = typeParam ? TYPE_MAP[typeParam] : undefined;

        const searchParams: Record<string, string> = {
            [Math.random().toString()]: '',
            category_id: '169',
            old_year: '1',
            order_datetimes: '1',
            showstype: '301',
            pagesize: '50',
        };

        // only add type_cid to searchParams when the type parameter is valid, otherwise keep it as undefined to fetch all exhibitions without filtering
        if (currentType?.cid) {
            searchParams.type_cid = currentType.cid;
        }

        const response = await got({
            method: 'get',
            url: apiUrl,
            headers: {
                // Must add referer and X-Requested-With to avoid 403
                referer: 'https://www.dpm.org.cn/classify/exhibition.html',
                'X-Requested-With': 'XMLHttpRequest',
            },
            searchParams,
        });

        const museumName = namespace.zh?.name || namespace.name;
        const titleTag = currentType ? currentType.name : '正在展览';
        const $ = load(response.data);

        const itemElements = $('.item').toArray();

        const rawItems = itemElements.map((item) => {
            const $item = $(item);
            const title = $item.find('a.aa').attr('title') || '';

            // Filter out 结束 or 暂闭 status exhibition
            const status = $item.find('.label').text().trim();
            if (status.includes('结束') || status.includes('暂闭')) {
                return null;
            }

            const rawImg = $item.find('img').attr('src');
            const imgUrl = `${baseUrl}${rawImg}`;
            const pTags = $item.find('.desc p');
            const location = pTags.eq(0).text().replaceAll('展览地点：', '').trim();

            const duration = pTags
                .eq(1)
                .contents()
                .filter((_, el: any) => el.nodeType === 3)
                .text()
                .replaceAll('展览时间：', '')
                .trim();

            const isIncomplete = duration.endsWith('-') || !duration.includes('-');

            const rawLink = $item.find('a.aa').attr('href');
            const hasNoLink = !rawLink;

            // if has no link, generate a fake one to store in cache, and add a flag in cache key to avoid conflict with real links
            // period hall rawLink example: /explore/building/236465.html, not start with http, need to add baseUrl
            const itemLink = hasNoLink ? `https://www.dpm.org.cn/classify/exhibition.html#no-details-${encodeURIComponent(title)}-${duration.replaceAll('-', '')}` : rawLink.startsWith('http') ? rawLink : `${baseUrl}${rawLink}`;

            const cacheKey = hasNoLink ? `dpm-exhibit-${title}-${duration}` : itemLink;

            return cache.tryGet(cacheKey, async () => {
                let fullDuration = duration;

                // if the exhibition is marked as incomplete, try to fetch the detail page to get the full duration, but only if there is a valid link to follow
                if (!hasNoLink && isIncomplete) {
                    const detailResponse = await got({
                        method: 'get',
                        url: itemLink,
                    });
                    const $d = load(detailResponse.data);
                    const detailTime = $d('.time em').text().trim();
                    if (detailTime) {
                        fullDuration = detailTime.replaceAll(/[\r\n]+/g, ' ').replaceAll(/\s+/g, ' '); // remove extra whitespace and newlines
                    }
                }

                // if fullduration doesn't contain a 4-digit year, it means we probably got a type label like "特展" or "专馆", so reset it to '未定/常设'
                if (!/\d{4}/.test(fullDuration)) {
                    fullDuration = '未定/常设';
                }

                const cleanDuration = fullDuration.replaceAll('.', '-').replaceAll('/', '-');

                // use YYYY-MM-DD for date format
                const dateMatches = cleanDuration.match(/\d{4}-\d{2}-\d{2}/g);

                let startDate: string | undefined;
                let endDate: string | undefined;

                if (dateMatches) {
                    startDate = dateMatches[0];
                    if (dateMatches.length >= 2) {
                        endDate = dateMatches[1];
                    }
                }

                const pubDate = startDate ? parseDate(startDate) : undefined;

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
                        {/* notice for exhibition w/o link */}
                        {hasNoLink && (
                            <p style={{ color: '#ff4d4f' }}>
                                <b>注：该展览暂无详情页，已链接至官网院内展览页</b>
                            </p>
                        )}
                    </div>
                );

                return {
                    title,
                    link: itemLink,
                    pubDate,
                    description,
                    // For further .ics file processing
                    _extra: {
                        museumName,
                        title,
                        location,
                        startDate, // format: YYYY-MM-DD or '未定/常设'
                        endDate, // format: YYYY-MM-DD or '未定/常设'
                        itemLink,
                    },
                } as DataItem;
            });
        });

        const items = (await Promise.all(rawItems)).filter((item): item is DataItem => item !== null);

        return {
            title: `${museumName} - ${titleTag}`,
            link: `${baseUrl}/classify/exhibition.html`,
            language: 'zh-CN',
            item: items,
        };
    },
};
