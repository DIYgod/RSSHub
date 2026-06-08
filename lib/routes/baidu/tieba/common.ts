import { createHash } from 'node:crypto';

import { Cookie } from 'tough-cookie';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getPlaywrightPage } from '@/utils/playwright';

/**
 * 解析百度 cookie 字符串为 Playwright 可用的 cookie 对象数组
 * 正确处理包含 '=' 的 cookie 值
 */
export function parseBaiduCookies(cookieStr: string): Array<{ name: string; value: string; domain: string; path: string }> {
    return cookieStr
        .split(';')
        .map((c) => Cookie.parse(c.trim()))
        .filter((c): c is Cookie => Boolean(c?.key))
        .map((c) => ({
            name: c.key,
            value: c.value,
            domain: '.tieba.baidu.com',
            path: '/',
        }));
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
 * 使用 Playwright 获取贴吧页面内容
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

    const cookies = parseBaiduCookies(cookie);
    const { waitForSelector = '.thread-card-wrapper, .virtual-list-item, .thread-content-box, .thread-card', timeout = 3000, retries = 3 } = options;

    const data = await cache.tryGet(
        cacheKey,
        async () => {
            let lastError: Error | undefined;

            /* eslint-disable no-await-in-loop -- Intentional sequential retry logic */
            for (let attempt = 0; attempt < retries; attempt++) {
                const { page, destroy } = await getPlaywrightPage(url, {
                    onBeforeLoad: async (page) => {
                        if (cookies.length > 0) {
                            await page.context().addCookies(cookies);
                        }
                    },
                    gotoConfig: { waitUntil: 'domcontentloaded' },
                });

                try {
                    // 等待页面稳定
                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    // 动态等待内容加载
                    try {
                        await page.waitForSelector(waitForSelector, { timeout });
                    } catch {
                        // 如果超时，继续执行
                    }

                    const html = await page.content();
                    checkSecurityVerification(html);
                    return html;
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

    return data as string;
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

/**
 * 通过 /c/f/frs/page API 获取贴吧帖子列表
 * 使用贴吧客户端签名认证，无需 Puppeteer
 */
const TIEBA_CLIENT_SECRET = 'tiebaclient!!!';

function computeSign(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).toSorted();
    const raw = sortedKeys.map((key) => `${key}=${params[key]}`).join('') + TIEBA_CLIENT_SECRET;
    return createHash('md5').update(raw).digest('hex');
}

export async function getTiebaForumData(params: { kw: string; cid?: string; isGood?: boolean; sortBy?: string }): Promise<any> {
    const cookie = config.baidu.cookie;
    if (!cookie) {
        throw new ConfigNotFoundError('Baidu Tieba RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#baidu">BAIDU_COOKIE</a>');
    }

    const bduss = cookie.match(/BDUSS=([^;]+)/)?.[1] || '';
    if (!bduss) {
        throw new ConfigNotFoundError('BAIDU_COOKIE must contain BDUSS. Please check your cookie configuration.');
    }

    const apiParams: Record<string, string> = {
        _client_id: 'wappc_1234567890123_456',
        _client_type: '2',
        _client_version: '12.20.1.0',
        _phone_imei: '000000000000000',
        from: 'tieba',
        kw: params.kw,
        rn: '30',
        pn: '1',
        BDUSS: bduss,
    };

    if (params.isGood) {
        apiParams.is_good = '1';
    }
    if (params.cid && params.cid !== '0') {
        apiParams.cid = params.cid;
    }
    if (params.sortBy === 'replied') {
        apiParams.sort_type = '1';
    }

    apiParams.sign = computeSign(apiParams);

    const url = 'https://tieba.baidu.com/c/f/frs/page';
    const cacheKey = `tieba:api:forum:${params.kw}:${params.cid || '0'}:${params.sortBy || 'created'}`;

    const data = await cache.tryGet(
        cacheKey,
        async () => {
            const { data: response } = await got.post(url, {
                form: apiParams,
            });
            return response;
        },
        config.cache.routeExpire,
        false
    );

    return data;
}
