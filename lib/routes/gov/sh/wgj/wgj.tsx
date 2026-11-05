import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function copyElements<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, element) => cloneNode(element, true));
    const root = new Document(copy.toArray());
    copy.each((_, element) => {
        element.parent = root;
    });
    return copy;
}

export const route: Route = {
    path: '/wgj/:page?',
    categories: ['government'],
    example: '/gov/sh/wgj',
    parameters: { page: '历史兼容参数，所有值均返回第 1 页，不翻页' },
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
            source: ['wsbs.wgj.sh.gov.cn/'],
            target: '/wgj',
        },
        {
            source: ['wsbs.wgj.sh.gov.cn/shwgj_ywtb/core/web/welcome/index!toResultNotice.action'],
            target: '/wgj',
        },
    ],
    name: '文旅局审批公告',
    maintainers: ['gideonsenku'],
    handler,
    url: 'wsbs.wgj.sh.gov.cn/',
};

async function handler() {
    const baseUrl = 'http://wsbs.wgj.sh.gov.cn';
    const currentUrl = `${baseUrl}/shwgj_ywtb/core/web/welcome/index!toResultNotice.action`;
    const searchParams = {
        flag: 1,
        'pageDoc.pageNo': 1,
    };
    const response = await got({
        method: 'post',
        url: currentUrl,
        searchParams,
    });

    const $ = load(response.data);
    const list = $('#div_md > table > tbody > tr > td:nth-child(1) > a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.prop('innerText')!.replaceAll(/\s/g, ''),
                link: $item.attr('href'),
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: baseUrl + item.link,
                });
                const $ = load(detailResponse.data);
                const dateElement = $('.content').children('[align="right"], p[style*="right"]').last();
                const dateText = dateElement.text().trim();
                const article = copyElements($('.content').first());
                if (!article.length) {
                    throw new Error(`Approval document content was not found: ${item.link}`);
                }
                article.children('h1, h2').remove();
                article
                    .children()
                    .filter((_, element) => $(element).attr('align') === 'right' || /text-align\s*:\s*right/.test($(element).attr('style') ?? ''))
                    .remove();
                item.description = article.html();
                const pubDate = dateText ? timezone(parseDate(dateText, 'YYYY-MM-DD', true), 8) : undefined;
                item.pubDate = pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined;

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
