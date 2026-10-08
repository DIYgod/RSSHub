import { escapeAttribute } from 'entities';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.cspengyuan.com';

export const route: Route = {
    path: '/research/:category?',
    example: '/cspengyuan/research/macroSpecialResearch',
    name: '信用研究',
    categories: ['finance'],
    maintainers: ['DIYgod'],
    features: { requirePuppeteer: true },
    parameters: { category: '官网信用研究栏目编码，默认 macroSpecialResearch。' },
    description: `| 栏目         | 编码                    |
| ------------ | ----------------------- |
| 宏观专题     | macroSpecialResearch    |
| 政策解读     | macroPolicyResearch     |
| 经济观察     | macroEconomiesResearch  |
| 大类资产     | macroAssetClassResearch |
| 宏观周报     | macroWeeklyResearch     |
| 债市专题研究 | bondSpecial             |
| 热点分析     | bondHotspot             |
| 债市周报     | bondWeekly              |
| 债市观察     | bondMonthly             |
| 债市年报     | bondYearly              |
| 行业评论     | industryComment         |
| 行业展望     | industryOutlook         |
| 行业专题     | industrySpecial         |`,
    radar: [{ source: ['www.cspengyuan.com/credit-research/:category'], target: '/research/:category' }],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'macroSpecialResearch';
    const link = `${baseUrl}/credit-research/${category}`;
    const apiUrl = `${baseUrl}/api/credit-research/category/${encodeURIComponent(category)}?page=0&size=20`;
    const { page, destroy } = await getPlaywrightPage(apiUrl, {
        onBeforeLoad: async (page) => {
            await page.setExtraHTTPHeaders({ Referer: link, Accept: 'application/json, text/plain, */*' });
            await page.route('**/*', (route) => (route.request().resourceType() === 'document' ? route.continue() : route.abort()));
        },
    });
    let response;
    try {
        await page.waitForSelector('pre');
        const body = await page.locator('pre').textContent();
        response = JSON.parse(body!);
    } finally {
        await destroy();
    }
    const limit = Number(ctx.req.query('limit')) || 20;
    const items = response.responseData.content.slice(0, limit).map((report) => {
        const pdfUrl = new URL(report.pdfUrl.startsWith('/api/files/') ? report.pdfUrl : `/api/files/${report.pdfUrl}`, baseUrl).href;
        return {
            title: report.title,
            link: `${baseUrl}/pdf-view?url=${encodeURIComponent(new URL(pdfUrl).pathname)}`,
            pubDate: timezone(parseDate(report.publishDate, 'YYYY-MM-DD HH:mm:ss'), 8),
            category: report.category,
            description: `<iframe src="${escapeAttribute(pdfUrl)}"></iframe>`,
            enclosure_url: pdfUrl,
            enclosure_type: 'application/pdf',
        };
    });
    return { title: `中证鹏元 - ${items[0]?.category ?? category}`, link, language: 'zh-CN' as const, item: items };
}
