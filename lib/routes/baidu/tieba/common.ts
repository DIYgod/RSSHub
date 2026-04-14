import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import cache from '@/utils/cache';

/**
 * 解析百度 cookie 字符串为 Puppeteer 可用的 cookie 对象数组
 * 正确处理包含 '=' 的 cookie 值
 */
export function parseBaiduCookies(cookieStr: string): Array<{ name: string; value: string; domain: string }> {
    return cookieStr
        .split(';')
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
        .map((c) => {
            const firstEqualIndex = c.indexOf('=');
            if (firstEqualIndex === -1) {
                return { name: c, value: '', domain: '.tieba.baidu.com' };
            }
            const name = c.slice(0, firstEqualIndex).trim();
            const value = c.slice(firstEqualIndex + 1).trim();
            return { name, value, domain: '.tieba.baidu.com' };
        });
}

/**
 * 检查 HTML 内容是否包含百度安全验证页面
 */
export function checkSecurityVerification(html: string): void {
    if (html.includes('安全验证') || html.includes('百度安全验证')) {
        throw new Error('Baidu security verification required. The cookie may be expired or invalid. Please update your BAIDU_COOKIE.');
    }
}

/**
 * 使用 Puppeteer 获取贴吧页面内容
 * 包含统一的 cookie 设置、安全验证检查和缓存逻辑
 * 带有重试机制处理瞬态错误
 */
export async function getTiebaPageContent(
    url: string,
    cacheKey: string,
    options: {
        waitForSelector?: string;
        timeout?: number;
        retries?: number;
    } = {}
): Promise<string> {
    const cookie = config.baidu.cookie;

    if (!cookie) {
        throw new ConfigNotFoundError('Baidu Tieba RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#baidu">BAIDU_COOKIE</a>');
    }

    const { getPuppeteerPage } = await import('@/utils/puppeteer');
    const { waitForSelector = '.thread-card-wrapper, .virtual-list-item, .thread-content-box, .thread-card', timeout = 3000, retries = 3 } = options;

    const data = await cache.tryGet(
        cacheKey,
        async () => {
            let lastError: Error | undefined;

            /* eslint-disable no-await-in-loop -- Intentional sequential retry logic */
            for (let attempt = 0; attempt < retries; attempt++) {
                const { page, destroy } = await getPuppeteerPage(url, { noGoto: true });

                try {
                    // 设置 Cookie（在访问页面前设置，减少一次导航）
                    const cookies = parseBaiduCookies(cookie);
                    await page.setCookie(...cookies);

                    // 访问目标页面 - 使用更宽松的等待条件
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

                    // 等待页面稳定
                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    // 动态等待内容加载
                    try {
                        await page.waitForSelector(waitForSelector, { timeout });
                    } catch {
                        // 如果超时，继续执行
                    }

                    return await page.content();
                } catch (error) {
                    lastError = error as Error;
                    // 如果是最后一次尝试，抛出错误
                    if (attempt === retries - 1) {
                        throw lastError;
                    }
                    // 等待后重试
                    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
                } finally {
                    await destroy();
                }
            }
            /* eslint-enable no-await-in-loop */

            throw lastError || new Error('Failed to fetch page content');
        },
        config.cache.routeExpire,
        false
    );

    const html = data as string;
    checkSecurityVerification(html);
    return html;
}

/**
 * 规范化 URL 为绝对地址
 */
export function normalizeUrl(href: string, base: string = 'https://tieba.baidu.com'): string {
    if (!href) {
        return '';
    }
    if (href.startsWith('http')) {
        return href;
    }
    const path = href.startsWith('/') ? href : `/${href}`;
    return `${base}${path}`;
}
