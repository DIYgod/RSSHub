import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/yz/:type',
    categories: ['university'],
    example: '/bupt/yz/all',
    parameters: { type: '学院英文缩写' },
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    name: '硕士研究生招生通知',
    maintainers: ['ihewro'],
    handler,
    description: `| 综合 | 信息与通信工程学院 | 电子工程学院 | 计算机学院 | 网络空间安全学院 | 人工智能学院 | 智能工程与自动化学院 | 集成电路学院 | 经济管理学院 | 数学科学学院 | 物理科学与技术学院 | 卓越工程师学院 | 人文学院 | 数字媒体与设计艺术学院 | 马克思主义学院 |
| ---- | ------------------ | ------------ | ---------- | ---------------- | ------------ | -------------------- | ------------ | ------------ | ------------ | ------------------ | -------------- | -------- | ---------------------- | -------------- |
| all  | sice               | see          | scs        | scss             | ai           | iea                  | ic           | sem          | math         | spst               | gce            | sh       | sdmda                  | mtri           |`,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();

    const struct = new Map([
        ['all', { url: 'https://yzb.bupt.edu.cn/zsjj/ssyjs.htm' }],
        ['sice', { url: 'https://sice.bupt.edu.cn/rcpy/yjsjy/zsgz.htm' }],
        ['see', { url: 'https://see.bupt.edu.cn/rcpy/zsxx.htm' }],
        ['scs', { url: 'https://scs.bupt.edu.cn/rcpy1/yjspy/zsxx1.htm' }],
        ['scss', { url: 'https://scss.bupt.edu.cn/zsjy1/yjszs.htm' }],
        ['ai', { url: 'https://ai.bupt.edu.cn/rcpy/yjspy/yjszs.htm' }],
        ['iea', { url: 'https://iea.bupt.edu.cn/rcpy/zsxx/yjszs.htm' }],
        ['ic', { url: 'https://ic.bupt.edu.cn/rcpy1/yjspy.htm' }],
        ['sem', { url: 'https://sem.bupt.edu.cn/jxxm/ss/zsxx.htm' }],
        ['math', { url: 'https://math.bupt.edu.cn/rcpy/zsxx.htm' }],
        ['spst', { url: 'https://spst.bupt.edu.cn/zszp/yjszs.htm' }],
        ['gce', { url: 'https://gce.bupt.edu.cn/rcpy/zsxx.htm' }],
        ['sh', { url: 'https://sh.bupt.edu.cn/rcpy/yjszs.htm' }],
        ['sdmda', { url: 'https://sdmda.bupt.edu.cn/jyjx/yjsjy/zsxx.htm' }],
        ['mtri', { url: 'https://mtri.bupt.edu.cn/yjsgz/zsgz.htm' }],
    ]);

    const college = struct.get(type);
    if (!college) {
        throw new Error(`Unknown college: ${type}`);
    }

    const context = await playwright();
    const page = await context.newPage();
    await page.route('**/*', (route) => {
        const request = route.request();
        request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
    });
    await page.goto(college.url, {
        waitUntil: 'networkidle',
    });
    const content = await page.content();

    const $ = load(content);

    const list = $('a[href*="/info/"]')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const $parent = $item.closest('li, dd');
            const text = $parent.text();
            let date: string | undefined;
            const full = /(20\d{2})[-./年]\s*(\d{1,2})[-./月]\s*(\d{1,2})/.exec(text);
            if (full) {
                date = `${full[1]}-${full[2]}-${full[3]}`;
            } else {
                const split = /(\d{1,2})\s*(20\d{2})[-./]\s*(\d{1,2})/.exec(text);
                if (split) {
                    date = `${split[2]}-${split[3]}-${split[1]}`;
                }
            }

            return {
                title: $item.attr('title') ?? ($item.find('h3, font, .bt').text() || $item.text()).trim(),
                link: new URL($item.attr('href')!, college.url).href,
                pubDate: date ? timezone(parseDate(date, 'YYYY-M-D'), 8) : undefined,
            };
        })
        .filter((item) => item.pubDate);

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await context.request.get(item.link!);
                const detail = await response.text();
                const $ = load(detail);
                $('.v_news_content style').remove();
                item.description = $('.v_news_content').html();
                return item;
            })
        )
    );

    await context.close();

    return {
        title: $('title').text(),
        link: college.url,
        item: result,
    };
}
