import { escapeText } from 'entities';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';

const sites = {
    cn: { url: 'https://www.cbre.com.cn/insights', language: 'zh-CN', name: '中国' },
    'cn-en': { url: 'https://www.cbre.com.cn/en/insights', language: 'en', name: 'Mainland China' },
    hk: { url: 'https://www.cbre.com.hk/insights', language: 'en', name: 'Hong Kong' },
    'hk-tc': { url: 'https://www.cbre.com.hk/zh-hk/insights', language: 'zh-TW', name: '香港' },
} as const;

export const route: Route = {
    path: '/research/:site?/:section?',
    example: '/cbre/research/cn/insights',
    name: '洞见和市场报告',
    categories: ['finance'],
    maintainers: ['DIYgod'],
    features: { requirePuppeteer: true },
    parameters: {
        site: 'cn：中国简体（默认）；cn-en：中国英文；hk：香港英文；hk-tc：香港繁体。',
        section: 'insights：洞见（默认）；markets：市场报告。',
    },
    description: '按官网发布时间返回最新报告摘要及公开 PDF 附件。香港繁体站的市场报告栏目目前提供英文报告，保留官网实际内容。',
    radar: [
        { source: ['www.cbre.com.cn/insights'], target: '/research/cn' },
        { source: ['www.cbre.com.cn/en/insights'], target: '/research/cn-en' },
        { source: ['www.cbre.com.hk/insights'], target: '/research/hk' },
        { source: ['www.cbre.com.hk/zh-hk/insights'], target: '/research/hk-tc' },
    ],
    handler,
};

function handleRequest(route) {
    const request = route.request();
    const type = request.resourceType();
    const url = new URL(request.url());
    if (['document', 'script'].includes(type)) {
        return route.continue();
    }
    if (['xhr', 'fetch'].includes(type) && ['www.cbre.com.cn', 'www.cbre.com.hk'].includes(url.host) && url.pathname.startsWith('/coveo/rest/')) {
        if (url.pathname === '/coveo/rest/search/v2' && request.method() === 'POST') {
            const params = new URLSearchParams(request.postData()!);
            params.set('sortCriteria', '@publishdate descending');
            return route.continue({ postData: params.toString() });
        }
        return route.continue();
    }
    return route.abort();
}

async function handler(ctx) {
    const site = ctx.req.param('site') ?? 'cn';
    const section = ctx.req.param('section') ?? 'insights';
    if (!Object.hasOwn(sites, site) || !['insights', 'markets'].includes(section)) {
        throw new InvalidParameterError('Choose cn, cn-en, hk or hk-tc, and insights or markets.');
    }
    const config = sites[site as keyof typeof sites];
    const { page, destroy } = await getPlaywrightPage(config.url, {
        noGoto: true,
        closeTimeout: 0,
        onBeforeLoad: async (page) => {
            await page.route('**/*', handleRequest);
        },
    });
    let data;
    try {
        await page.goto(config.url, { waitUntil: 'domcontentloaded' });
        const selector = `iframe[src*="${section === 'insights' ? 'insights-research-results' : 'search-market-results'}"]`;
        await page.waitForSelector(selector, { state: 'attached' });
        const src = await page.locator(selector).first().getAttribute('src');
        const iframeUrl = new URL(src!, config.url);
        const searchHub = iframeUrl.pathname.split('/').at(-1);
        const [response] = await Promise.all([
            page.waitForResponse((response) => {
                const request = response.request();
                const url = new URL(response.url());
                return (
                    url.host === iframeUrl.host &&
                    url.pathname === '/coveo/rest/search/v2' &&
                    request.method() === 'POST' &&
                    request.frame() === page.mainFrame() &&
                    new URLSearchParams(request.postData()!).get('searchHub') === searchHub
                );
            }),
            page.goto(iframeUrl.href, { waitUntil: 'domcontentloaded' }),
        ]);
        if (!response.ok()) {
            throw new Error(`CBRE research API returned HTTP ${response.status()}. Check that the selected site and section are available.`);
        }
        data = await response.json();
    } finally {
        await destroy();
    }
    if (!Array.isArray(data.results)) {
        throw new TypeError('CBRE did not return its research results. Check that the selected site and section are available.');
    }
    const item: DataItem[] = data.results.slice(0, Number(ctx.req.query('limit')) || 9).map((result) => {
        const report = result.raw;
        const pdf = report.sprinklrattachmenturl;
        const attachment = pdf && new URL(pdf).pathname.toLowerCase().endsWith('.pdf') ? pdf : undefined;
        return {
            title: result.title,
            link: new URL(result.clickUri, config.url).href,
            pubDate: report.publishdate ? parseDate(report.publishdate.replaceAll('/', '-').replace('@', 'T')) : undefined,
            description: `<p>${escapeText(report.longdescription || report.shortdescription || result.excerpt || '')}</p>`,
            category: [...(report.themename || []), ...(report.propertytypename || []), ...(report.topicname || [])],
            enclosure_url: attachment,
            enclosure_type: attachment ? 'application/pdf' : undefined,
        };
    });
    return { title: `CBRE - ${config.name} - ${section === 'insights' ? 'Insights' : 'Market Reports'}`, link: config.url, language: config.language, item };
}
