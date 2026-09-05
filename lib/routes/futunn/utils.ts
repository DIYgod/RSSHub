import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { BrowserContext } from 'patchright';

import got from '@/utils/got';
import logger from '@/utils/logger';

/**
 * 富途 WAF 会拦截无浏览器指纹的请求(如 got), 返回混淆 JS 壳页面,
 * 其中不含 `.origin_content`, 导致条目正文为空。
 * 此函数先尝试 got, 若检测到被 WAF 拦截, 则改用 playwright 渲染页面后重新提取。
 */
export async function fetchArticleDetail(context: BrowserContext, link: string): Promise<CheerioAPI> {
    let html = '';

    try {
        const response = await got({ method: 'get', url: link });
        html = response.data;

        // got 拿到正常页面时直接返回
        if (load(html)('.origin_content').length > 0) {
            return load(html);
        }
    } catch {
        // got 抛错(如 403), 继续走 playwright
    }

    logger.warn(`futunn: got 请求可能被 WAF 拦截, 改用 playwright 渲染: ${link}`);

    try {
        const page = await context.newPage();
        try {
            // 只加载文档与脚本, 跳过图片/样式/字体等资源
            await page.route('**/*', (route) => {
                const request = route.request();
                request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
            });

            await page.goto(link, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('.origin_content', { timeout: 30000 });
            html = await page.content();

            return load(html);
        } finally {
            await page.close();
        }
    } catch (error) {
        // playwright 渲染失败时返回空文档, 与 got 被 WAF 拦截时行为一致(description 为空)
        logger.error(`futunn: playwright 渲染失败: ${link} - ${error}`);
        return load('');
    }
}

/** 从富途文章页提取描述与分类 */
export function extractArticleInfo(content: CheerioAPI) {
    content('.futu-news-time-stamp').remove();
    content('.nnstock').each((_, el) => {
        content(el).replaceWith(`<a href="${content(el).attr('href')}">${content(el).text().replaceAll('$', '')}</a>`);
    });

    return {
        description: content('.origin_content').html(),
        category: [
            ...content('.news__from-topic__title')
                .toArray()
                .map((a) => content(a).text().trim()),
            ...content('#relatedStockWeb .stock-name')
                .toArray()
                .map((s) => content(s).text().trim()),
        ],
    };
}
