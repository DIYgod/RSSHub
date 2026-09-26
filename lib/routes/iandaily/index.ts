import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { findEditionImage, getColumnNames, parseEditionsFromScript, renderEdition } from './utils';

const baseUrl = 'https://iandaily.xyz';
const homeUrl = `${baseUrl}/`;

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/iandaily',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['iandaily.xyz/', 'iandaily.xyz/d/:date'],
        },
    ],
    name: '每日消化',
    maintainers: ['DeyunMa'],
    handler,
    url: 'iandaily.xyz',
    description: '将每期日报作为一条 RSS 条目，并保留栏目、摘要与原始信息链接。',
};

async function handler(): Promise<Data> {
    const html = await ofetch(homeUrl, { responseType: 'text' });
    const $ = load(html);
    const scriptPath = $('script[type="module"][src*="/assets/index-"]').attr('src');
    if (!scriptPath) {
        throw new Error('Unable to find the iandaily application bundle; the site structure may have changed');
    }

    const scriptUrl = new URL(scriptPath, homeUrl).href;
    const script = await ofetch(scriptUrl, { responseType: 'text' });
    const editions = parseEditionsFromScript(script);

    return {
        title: '伊恩日刊',
        description: $('meta[name="description"]').attr('content') ?? '产品设计师伊恩的每日消化。',
        link: homeUrl,
        image: `${baseUrl}/favicon.png`,
        language: 'zh-CN',
        item: editions.map((edition) => {
            const link = `${baseUrl}/d/${edition.date}`;
            return {
                title: `伊恩日刊 · ${edition.date}`,
                description: renderEdition(edition),
                link,
                guid: link,
                author: '伊恩',
                pubDate: parseDate(edition.date, 'YYYY-MM-DD'),
                category: getColumnNames(edition),
                image: findEditionImage(edition, baseUrl),
            };
        }),
    };
}
