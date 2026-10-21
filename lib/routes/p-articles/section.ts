import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { isValidHost } from '@/utils/valid-host';

import { ProcessFeed, rootUrl } from './utils';

export const route: Route = {
    path: '/section/:section',
    categories: ['reading'],
    example: '/p-articles/section/critics',
    parameters: { section: '版块名称, 可在对应版块 URL 中找到, 子版块链接用`-`连接' },
    name: '版块',
    maintainers: ['Insomnia1437'],
    handler,
    radar: [
        { source: ['p-articles.com/works/'], target: '/section/works' },
        { source: ['p-articles.com/critics/'], target: '/section/critics' },
        { source: ['p-articles.com/issues/'], target: '/section/issues' },
        { source: ['p-articles.com/heteroglossia/'], target: '/section/heteroglossia' },
        { source: ['p-articles.com/nianhua/'], target: '/section/nianhua' },
        { source: ['p-articles.com/one_take/'], target: '/section/one_take' },
    ],
};

async function handler(ctx) {
    let sectionName: string = ctx.req.param('section');
    if (!isValidHost(sectionName) || !['works', 'critics', 'issues', 'heteroglossia', 'nianhua', 'one_take'].includes(sectionName.split('-', 1)[0])) {
        throw new InvalidParameterError('Invalid section');
    }

    sectionName = sectionName.replace('-', '/');
    sectionName += '/';
    const sectionUrl = new URL(sectionName, rootUrl).href;
    const response = await ofetch(sectionUrl);
    const $ = load(response);
    const topHref = $('div.inner_top_title_01 > h1 > a').prop('href');
    if (!topHref) {
        throw new InvalidParameterError('The requested page is not an article section');
    }
    const topInfo = {
        title: $('div.inner_top_title_01 > h1 > a').text(),
        link: new URL(topHref, rootUrl).href,
    };

    const list = $('div.contect_box_04 > a')
        .toArray()
        .map((element) => {
            const info = {
                title: $(element).find('h1').text(),
                link: new URL($(element).attr('href')!, rootUrl).href,
            };
            return info;
        });
    list.unshift(topInfo);

    const items = await pMap(
        list,
        async (info) => {
            const details = await cache.tryGet(`p-articles:article:body:${info.link}`, async () => {
                const response = await ofetch(info.link);
                return ProcessFeed({}, response);
            });
            return { ...info, ...details };
        },
        { concurrency: 3 }
    );
    return {
        title: '虚词 p-articles',
        link: sectionUrl,
        item: items,
        language: 'zh-TW' as const satisfies Language,
    };
}
