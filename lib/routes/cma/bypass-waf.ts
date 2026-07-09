import { createHash } from 'crypto';
import got, { Options as GotOptions } from 'got';
import { CookieJar } from 'tough-cookie';

/**
 * 发起请求并自动处理 SafeLine 的 PoW 反爬验证
 * @param url 目标 URL
 * @param options got 请求选项（如 searchParams, headers 等）
 * @returns 响应体字符串（HTML 或 JSON）
 */
export async function fetchWithPow(url: string, options?: GotOptions): Promise<string> {
    const cookieJar = new CookieJar();

    // 第一次请求（可能触发反爬）
    const firstResp = await got(url, {
        ...options,
        cookieJar,
        // 允许重定向，通常需要
        followRedirect: true,
    });

    const html = firstResp.body;

    // 尝试从 HTML 中提取 PoW 参数
    const prefixMatch = html.match(/prefix\s*=\s*['"]([^'"]+)['"]/);
    if (!prefixMatch) {
        // 没有 PoW，直接返回内容
        return html;
    }

    const prefix = prefixMatch[1];
    const zeroBitsMatch = html.match(/leading_zero_bit\s*=\s*(\d+)/);
    const zeroBits = zeroBitsMatch ? parseInt(zeroBitsMatch[1], 10) : 9;

    // 从 cookieJar 或响应头中获取 challenge
    const challengeCookie = await cookieJar.getCookieString(url);
    const challenge = challengeCookie
        .split(';')
        .map(c => c.trim())
        .find(c => c.startsWith('safeline_bot_challenge='))
        ?.split('=')[1];

    if (!challenge) {
        // 没有 challenge，视为无需验证
        return html;
    }

    // 暴力求解 suffix（SHA1 前 zeroBits 位为 0）
    let cnt = 0;
    let suffix = '';
    const targetPrefix = '0'.repeat(zeroBits);
    while (true) {
        const s = cnt.toString(16);
        const hash = createHash('sha1').update(prefix + s).digest();
        // 将 hash 转为 160 位二进制字符串
        const binary = BigInt('0x' + hash.toString('hex'))
            .toString(2)
            .padStart(160, '0');
        if (binary.startsWith(targetPrefix)) {
            suffix = s;
            break;
        }
        cnt++;
    }

    // 构造答案并写入 cookie
    const ans = challenge + suffix;
    await cookieJar.setCookie(`safeline_bot_challenge_ans=${ans}; Path=/`, url);

    // 第二次请求，携带验证通过后的 cookie
    const secondResp = await got(url, {
        ...options,
        cookieJar,
        followRedirect: true,
    });

    return secondResp.body;
}