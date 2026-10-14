import { load } from 'cheerio';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/notice',
    categories: ['university'],
    example: '/zuel/notice',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['wap.zuel.edu.cn/', 'wap.zuel.edu.cn/notice/list.htm'],
        },
    ],
    name: '通知公告',
    maintainers: ['nczitzk'],
    handler,
    url: 'wap.zuel.edu.cn/',
};

async function handler() {
    const rootUrl = 'http://wap.zuel.edu.cn';
    const currentUrl = `${rootUrl}/notice/list.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.list_item')
        .toArray()
        .flatMap((item): DataItem[] => {
            const $item = $(item);

            const a = $item.find('.Article_Title a');
            const link = getNoticeLink(a.attr('href'), currentUrl);
            if (!link) {
                return [];
            }

            return [
                {
                    title: a.text(),
                    pubDate: getPublicationDate($item.find('.Article_PublishDate').text()),
                    link,
                },
            ];
        });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`zuel:notice-body:v2:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);
                const article = content('.wp_articlecontent, .psgCont, .infodetail').first();
                const description = article.html();
                if (!description?.trim() || (!article.text().trim() && !article.find('img[src], video, audio, iframe[src], a[href], svg, picture').length)) {
                    throw new NotFoundError('The notice page does not contain an available article body.');
                }
                return { description };
            });
            return { ...item, description: detail.description };
        },
        { concurrency: 3 }
    );

    return {
        title: '中南财经政法大学 - 通知公告',
        link: currentUrl,
        item: items,
    };
}

function getNoticeLink(href: string | undefined, baseUrl: string) {
    if (!href) {
        return;
    }
    try {
        const url = new URL(href, baseUrl);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
    } catch {
        return;
    }
}

function getPublicationDate(value: string) {
    if (!value.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
