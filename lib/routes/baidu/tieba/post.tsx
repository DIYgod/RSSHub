import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';

import { parseRelativeTime } from './utils';

/**
 * 获取最新的帖子回复（倒序查看）
 *
 * @param {*} id 帖子ID
 * @param {number} [lz=0] 是否只看楼主（0: 查看全部, 1: 只看楼主）
 * @param {number} [pn=7e6] 帖子最大页码（默认假设为 7e6，如果超出假设则根据返回的最大页码再请求一次，否则可以节省一次请求）
 * 这个默认值我测试下来 7e6 是比较接近最大值了，因为当我输入 8e6 就会返回第一页的数据而不是最后一页了
 * @returns
 */
async function getPost(id: string, lz = 0, pn = 7e6) {
    const cookie = config.baidu.cookie;
    if (!cookie) {
        throw new ConfigNotFoundError('Baidu Tieba RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#baidu">BAIDU_COOKIE</a>');
    }

    const { getPuppeteerPage } = await import('@/utils/puppeteer');
    const url = `https://tieba.baidu.com/p/${id}?see_lz=${lz}&pn=${pn}`;

    const data = await cache.tryGet(
        `tieba:post:${id}:${lz}:${pn}`,
        async () => {
            const { page, destroy } = await getPuppeteerPage(url, {
                noGoto: true,
            });

            try {
                // 先访问以设置域名
                await page.goto('https://tieba.baidu.com', { waitUntil: 'domcontentloaded', timeout: 30000 });

                // 设置 Cookie
                const cookies = cookie.split(';').map((c) => {
                    const [name, value] = c.trim().split('=');
                    return {
                        name: name.trim(),
                        value: value || '',
                        domain: '.tieba.baidu.com',
                    };
                });
                await page.setCookie(...cookies);

                // 访问目标页面
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

                // 动态等待回复内容加载，最多3秒
                try {
                    await page.waitForSelector('.virtual-list-item', { timeout: 3000 });
                } catch {
                    // 如果3秒内没加载出来，继续执行
                }

                return await page.content();
            } finally {
                await destroy();
            }
        },
        config.cache.routeExpire,
        false
    );

    const $ = load(data as string);
    const max = Number.parseInt($('[max-page]').attr('max-page') || '0');
    if (max > pn) {
        return getPost(id, lz, max);
    }
    return data as string;
}

export const route: Route = {
    path: ['/tieba/post/:id', '/tieba/post/lz/:id'],
    categories: ['bbs'],
    example: '/baidu/tieba/post/686961453',
    parameters: { id: '帖子 ID' },
    features: {
        requireConfig: [
            {
                name: 'BAIDU_COOKIE',
                optional: false,
                description: '百度 cookie 值，用于需要登录的贴吧页面',
            },
        ],
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['tieba.baidu.com/p/:id'],
        },
    ],
    name: '帖子动态',
    maintainers: ['u3u', 'FlanChanXwO'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const lz = ctx.req.path.includes('lz') ? 1 : 0;
    const html = await getPost(id, lz);
    const $ = load(html);

    // 检查是否遇到安全验证
    if ($('title').text().includes('安全验证') || html.includes('百度安全验证')) {
        throw new Error('Baidu security verification required. The cookie may be expired or invalid. Please update your BAIDU_COOKIE.');
    }

    const title = $('.pb-title-wrap .pb-title').text().trim() || '';

    // 使用新的 Vue 渲染页面选择器 - 只选择 virtual-list-item 避免重复
    const list = $('.virtual-list-item');

    if (list.length === 0) {
        throw new Error('No post replies found. The post may not exist or the cookie is invalid.');
    }

    return {
        title: lz ? `【只看楼主】${title}` : title,
        link: `https://tieba.baidu.com/p/${id}?see_lz=${lz}`,
        description: `${title}的最新回复`,
        item: list
            .toArray()
            .map((element) => {
                const item = $(element);

                // 作者名
                const authorName = item.find('.head-name').text().trim();

                // 跳过无效用户（无作者名的条目）
                if (!authorName) {
                    return null;
                }

                // 内容 - 从 pb-rich-text 获取
                const contentItems = item.find('.pb-rich-text .pb-content-item');
                let postContent = '';
                contentItems.each((_, el) => {
                    const text = $(el).text().trim();
                    if (text) {
                        postContent += `<p>${text}</p>`;
                    }
                });

                // 图片
                const images = item
                    .find('.image-list-wrapper img')
                    .toArray()
                    .map((img) => $(img).attr('src') || $(img).attr('data-src') || '')
                    .filter(Boolean)
                    .map((src) => `<img src="${src}" alt="${title}">`)
                    .join('');

                // 楼层和时间
                const descText = item.find('.pc-pb-comments-desc, .comment-desc-left').text().trim();
                const floorMatch = descText.match(/第(\d+)楼/);
                const floor = floorMatch ? `${floorMatch[1]}楼` : '';

                // 时间 - 可能是 "2分钟前" 这样的相对时间
                const timeMatch = descText.match(/(\d+分钟前|\d+小时前|今天\s*\d{2}:\d{2}|\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/);
                const timeText = timeMatch ? timeMatch[1] : '';

                // 解析时间并验证有效性
                const parsedDate = timeText ? parseRelativeTime(timeText) : null;
                const validPubDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? timezone(parsedDate, +8) : undefined;

                return {
                    title: `${authorName} 回复了帖子《${title}》`,
                    description: renderToString(
                        <>
                            <div dangerouslySetInnerHTML={{ __html: postContent }} />
                            <div dangerouslySetInnerHTML={{ __html: images }} />
                            <p>
                                楼层：{floor}
                                <br />
                                时间：{timeText}
                            </p>
                        </>
                    ),

                    pubDate: validPubDate,
                    author: authorName,
                    link: `https://tieba.baidu.com/p/${id}`,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null),
    };
}
