import { load } from 'cheerio';
import { escapeAttribute } from 'entities';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';

const sites = {
    cn: { host: 'www.savills.com.cn', region: 'China', language: 'zh-CN', name: '中国' },
    hk: { host: 'www.savills.com.hk', region: 'Hong-Kong', language: 'en', name: 'Hong Kong' },
    'hk-tc': { host: 'tc.savills.com.hk', region: 'Hong-Kong', language: 'zh-TW', name: '香港' },
} as const;

export const route: Route = {
    path: '/research/:site?',
    example: '/savills/research/cn',
    name: '市场研究',
    categories: ['finance'],
    maintainers: ['DIYgod'],
    features: { requirePuppeteer: true },
    parameters: { site: 'cn：中国简体中文（默认）；hk：香港英文；hk-tc：香港繁体中文。' },
    description: '返回官网最新研究报告的摘要，以及源站提供的 PDF 附件。英文中国站目前返回错误页面；香港英文站也会发布亚太区域研究。',
    radar: [
        { source: ['www.savills.com.cn/insight-and-opinion/research.aspx'], target: '/research/cn' },
        { source: ['www.savills.com.hk/insight-and-opinion/research.aspx'], target: '/research/hk' },
        { source: ['tc.savills.com.hk/insight-and-opinion/research.aspx'], target: '/research/hk-tc' },
    ],
    handler,
};

async function handler(ctx) {
    const site = ctx.req.param('site') ?? 'cn';
    if (!Object.hasOwn(sites, site)) {
        throw new InvalidParameterError('Choose cn, hk or hk-tc.');
    }
    const config = sites[site as keyof typeof sites];
    const baseUrl = `https://${config.host}`;
    const link = `${baseUrl}/insight-and-opinion/research.aspx?rc=${config.region}&p=&t=&f=date&q=&page=1`;
    const { page, destroy } = await getPlaywrightPage(link, {
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (route.request().resourceType() === 'document' ? route.continue() : route.abort()));
        },
    });
    let response;
    try {
        await page.waitForSelector('#ListingContainer');
        response = await page.content();
    } finally {
        await destroy();
    }
    const $ = load(response);
    const item = $('#ListingContainer article')
        .toArray()
        .slice(0, Number(ctx.req.query('limit')) || 10)
        .map((element) => {
            const card = $(element);
            const title = card.find('h3 a').first();
            const image = card.find('img[data-src]').first().attr('data-src');
            const pdf = card.find('.sv-card__download-link[href]').first().attr('href');
            const date = card.find('time').attr('datetime');
            return {
                title: title.text(),
                link: new URL(title.attr('href')!, baseUrl).href,
                pubDate: date ? parseDate(date) : undefined,
                category: card
                    .find('.sv-card-meta__data, .sv-tag')
                    .toArray()
                    .map((tag) => $(tag).attr('title') || $(tag).text()),
                description: `${image ? `<img src="${escapeAttribute(new URL(image, baseUrl).href)}">` : ''}${card.find('.sv-card-intro').prop('outerHTML') || ''}`,
                enclosure_url: pdf ? new URL(pdf, baseUrl).href : undefined,
                enclosure_type: pdf ? 'application/pdf' : undefined,
            };
        });
    return { title: `Savills - ${config.name} - ${$('#txt_01').first().text()}`, link, language: config.language, item };
}
