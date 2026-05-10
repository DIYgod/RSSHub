import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

export const route: Route = {
    path: '/exhibitions',
    categories: ['travel'],
    example: '/dpm/exhibitions',
    // Use dpm English version channel name
    name: 'Current Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.dpm.org.cn/classify/exhibition.html'],
            target: '/exhibitions',
        },
    ],
    handler: async (_ctx: Context): Promise<Data> => {
        const baseUrl = 'https://www.dpm.org.cn';
        const apiUrl = `${baseUrl}/searchs/exhibition.html`;

        const response = await got({
            method: 'get',
            url: apiUrl,
            headers: {
                // Must add referer and X-Requested-With to avoid 403
                referer: 'https://www.dpm.org.cn/classify/exhibition.html',
                'X-Requested-With': 'XMLHttpRequest',
            },
            searchParams: {
                [Math.random().toString()]: '',
                category_id: '169',
                old_year: '1',
                order_datetimes: '1',
                showstype: '301',
                type_cid: '1',
                pagesize: '20',
            },
        });

        const museumName = namespace.zh?.name || namespace.name || '故宫博物院';
        const $ = load(response.data);

        const rawItems = $('.item, .exhibition-item')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const title = $item.attr('title') || $item.find('h1').text() || $item.find('.t1').text();

                if (!title.trim()) {
                    return null;
                }

                // Filter out 结束 status exhibition
                const status = $item.find('.label').text().trim();
                if (status.includes('结束')) {
                    return null;
                }

                const rawImg = $item.find('img').attr('src');
                const imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${baseUrl}${rawImg}`) : '';
                const pTags = $item.find('.desc p');
                const location = pTags.eq(0).text().replaceAll('展览地点：', '').trim();

                const duration = pTags
                    .eq(1)
                    .contents()
                    .filter(function () {
                        return this.nodeType === 3;
                    })
                    .text()
                    .replaceAll('展览时间：', '')
                    .trim();

                const isIncomplete = duration.endsWith('-') || !duration.includes('-');

                const rawLink = $item.find('a.t1').attr('href') || $item.find('a.aa').attr('href');
                const hasNoLink = !rawLink || rawLink.includes('javascript:void(0)') || rawLink === '#';

                // if has no link, generate a fake one to store in cache, and add a flag in cache key to avoid conflict with real links
                const itemLink = hasNoLink
                    ? `https://www.dpm.org.cn/classify/exhibition.html#no-details-${encodeURIComponent(title)}-${duration.replaceAll('-', '')}`
                    : (rawLink.startsWith('http') ? rawLink : `${baseUrl}${rawLink}`);

                const cacheKey = hasNoLink ? `dpm-exhibit-${title}-${duration}` : itemLink;

                return cache.tryGet(cacheKey, async () => {
                    let fullDuration = duration;

                    // if the exhibition is marked as incomplete, try to fetch the detail page to get the full duration, but only if there is a valid link to follow
                    if (!hasNoLink && isIncomplete) {
                        try {
                            const detailResponse = await got({ method: 'get', url: itemLink });
                            const $d = load(detailResponse.data);
                            const detailTime = $d('.time em').text().trim();
                            if (detailTime) {
                                fullDuration = detailTime;
                            }
                        } catch {
                            // If the detail page fails to load, just keep the original duration.
                        }
                    }

                    const cleanDuration = fullDuration.replaceAll('.', '-').replaceAll('/', '-');

                    // use YYYY-MM-DD for date format
                    const dateMatches = cleanDuration.match(/\d{4}-\d{2}-\d{2}/g);

                    let startDate = '';
                    let endDate = '';

                    if (dateMatches) {
                        startDate = dateMatches[0];
                        if (dateMatches.length >= 2) {
                            endDate = dateMatches[1];
                        }
                    }

                    const pubDate = startDate ? parseDate(startDate) : undefined;

                    const detailNotice = hasNoLink
                        ? '<p style="color: #ff4d4f;"><b>注：该展览暂无详情页，已链接至官网院内展览页</b></p>'
                        : '';

                    const $desc = load('<div></div>', null, false);

                    if (imgUrl) {
                        $desc('div').append(`<img src="${imgUrl}"><br>`);
                    }

                    $desc('div').append(`<p><b>地点：</b>${location}</p>`);
                    $desc('div').append(`<p><b>开展：</b>${startDate || '未定/常设'}</p>`);
                    $desc('div').append(`<p><b>闭展：</b>${endDate || '未定/常设'}</p>`);

                    if (detailNotice) {
                        $desc('div').append(detailNotice);
                    }

                    if (fullDuration) {
                        $desc('div').append(`<p><small>原始展期：${fullDuration}</small></p>`);
                    }

                    return {
                        title,
                        link: itemLink,
                        pubDate,
                        description: $desc.html(),
                        _extra: {
                            museumName,
                            title,
                            location,
                            startDate,
                            endDate,
                            itemLink,
                        },
                    } as DataItem;
                });
            });

        // filter out null items and assert the type to DataItem[]
        const items = (await Promise.all(rawItems)).filter((item): item is DataItem => item !== null);

        return {
            title: `${museumName} - 特展`,
            link: `${baseUrl}/classify/exhibition.html`,
            language: 'zh-CN',
            item: items,
        };
    },
};