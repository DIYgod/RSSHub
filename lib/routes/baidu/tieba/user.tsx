import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getTiebaPageContent, normalizeUrl } from './common';

export const route: Route = {
    path: '/tieba/user/:uid',
    categories: ['bbs'],
    example: '/baidu/tieba/user/斗鱼游戏君',
    parameters: { uid: '用户 ID' },
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
    name: '用户帖子',
    maintainers: ['igxlin', 'nczitzk', 'FlanChanXwO'],
    handler,
    description: `用户 ID 可以通过打开用户的主页后查看地址栏的 \`un\` 字段来获取。`,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const encodedUid = encodeURIComponent(uid);
    const url = `https://tieba.baidu.com/home/main?un=${encodedUid}`;

    const html = await getTiebaPageContent(url, `tieba:user:${uid}`, {
        waitForSelector: '.thread-card',
        timeout: 3000,
    });

    const $ = load(html);

    const name = $('span.userinfo_username').text() || uid;
    const list = $('.thread-card');

    if (list.length === 0) {
        throw new Error('No user posts found. The page structure may have changed or the user does not exist.');
    }

    return {
        title: `${name} 的贴吧`,
        link: `https://tieba.baidu.com/home/main?un=${encodedUid}`,
        item: list.toArray().map((element) => {
            const item = $(element);

            // 作者
            const authorName = item.find('.head-name').text().trim() || name;

            // 标题
            const title = item.find('.title-text').text().trim();

            // 内容
            const content = item.find('.tb-richtext .text').text().trim();

            // 图片
            const images = item
                .find('.image-list-item img')
                .toArray()
                .map((img) => $(img).attr('src') || $(img).attr('data-src') || '')
                .filter(Boolean);

            // 时间
            const timeText = item.find('.post-num').text().trim();
            const parsedDate = timeText ? parseDate(timeText, ['YYYY-MM-DD']) : null;
            const validPubDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? timezone(parsedDate, +8) : undefined;

            // 链接
            const link = normalizeUrl(item.find('a.thread-card-content').attr('href') || '');

            return {
                title,
                pubDate: validPubDate,
                author: authorName,
                description: renderToString(
                    <>
                        {content ? <p>{content}</p> : null}
                        {images.length > 0 ? (
                            <div>
                                {images.map((img) => (
                                    <img src={img} alt="" style={{ maxWidth: '100%', margin: '5px 0' }} />
                                ))}
                            </div>
                        ) : null}
                    </>
                ),
                link,
            };
        }),
    };
}
