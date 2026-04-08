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
 */
export async function getTiebaPageContent(
    url: string,
    cacheKey: string,
    options: {
        waitForSelector?: string;
        timeout?: number;
    } = {}
): Promise<string> {
    const cookie = config.baidu.cookie;

    if (!cookie) {
        throw new ConfigNotFoundError('Baidu Tieba RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#baidu">BAIDU_COOKIE</a>');
    }

    const { getPuppeteerPage } = await import('@/utils/puppeteer');
    const { waitForSelector = '.thread-card-wrapper, .virtual-list-item, .thread-content-box, .thread-card', timeout = 3000 } = options;

    const data = await cache.tryGet(
        cacheKey,
        async () => {
            const { page, destroy } = await getPuppeteerPage(url, { noGoto: true });

            try {
                // 设置 Cookie（在访问页面前设置，减少一次导航）
                const cookies = parseBaiduCookies(cookie);
                await page.setCookie(...cookies);

                // 访问目标页面
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

                // 动态等待内容加载
                try {
                    await page.waitForSelector(waitForSelector, { timeout });
                } catch {
                    // 如果超时，继续执行
                }

                return await page.content();
            } finally {
                await destroy();
            }
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
