import { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import sanitizeHtml from 'sanitize-html';
import { parseToken } from '@/routes/xueqiu/cookies';
import puppeteer from '@/utils/puppeteer';

const rootUrl = 'https://xueqiu.com';

export const route: Route = {
    path: '/user/:id/:type?',
    categories: ['finance'],
    example: '/xueqiu/user/8152922548',
    parameters: { id: '用户 id, 可在用户主页 URL 中找到', type: '动态的类型, 不填则默认全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xueqiu.com/u/:id'],
            target: '/user/:id',
        },
    ],
    name: '用户动态',
    maintainers: ['imlonghao'],
    handler,
    description: `| 原发布 | 长文 | 问答 | 热门 | 交易 |
| ------ | ---- | ---- | ---- | ---- |
| 0      | 2    | 4    | 9    | 11   |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') || 10;
    const typename = {
        10: '全部',
        0: '原发布',
        2: '长文',
        4: '问答',
        9: '热门',
        11: '交易',
    };

    const link = `${rootUrl}/u/${id}`;
    const token = await parseToken(link);

    const browser = await puppeteer({ stealth: true });
    try {
        const mainPage = await browser.newPage();

        await mainPage.setExtraHTTPHeaders({
            Cookie: token as string,
            Referer: link,
        });

        await mainPage.goto(link, {
            waitUntil: 'domcontentloaded',
        });
        await mainPage.waitForFunction(() => document.readyState === 'complete');

        const apiUrl = `${rootUrl}/v4/statuses/user_timeline.json?user_id=${id}&type=${type}`;
        const response = await mainPage.evaluate(async (url) => {
            const response = await fetch(url);
            return response.json();
        }, apiUrl);

        if (!response?.statuses) {
            throw new Error('获取用户动态数据失败');
        }

        const data = response.statuses.filter((s) => s.mark !== 1);

        if (!data.length) {
            throw new Error('未找到有效的动态数据');
        }

        const items = await Promise.all(
            data.map((item) =>
                cache.tryGet(item.target, async () => {
                    const detailUrl = rootUrl + item.target;
                    try {
                        await mainPage.goto(detailUrl, {
                            waitUntil: 'domcontentloaded',
                        });
                        await mainPage.waitForFunction(() => document.readyState === 'complete');

                        const content = await mainPage.evaluate(() => {
                            const articleContent = document.querySelector('.article__bd')?.innerHTML || '';
                            const statusMatch = document.documentElement.innerHTML.match(/SNOWMAN_STATUS = (.*?});/);
                            return {
                                articleContent,
                                statusData: statusMatch ? statusMatch[1] : null,
                            };
                        });

                        if (content.statusData) {
                            const data = JSON.parse(content.statusData);
                            item.text = data.text;
                        }

                        const retweetedStatus = item.retweeted_status ? `<blockquote>${item.retweeted_status.user.screen_name}:&nbsp;${item.retweeted_status.description}</blockquote>` : '';
                        const description = content.articleContent || item.description + retweetedStatus;

                        return {
                            title: item.title || sanitizeHtml(description, { allowedTags: [], allowedAttributes: {} }),
                            description: item.text ? item.text + retweetedStatus : description,
                            pubDate: parseDate(item.created_at),
                            link: rootUrl + item.target,
                        };
                    } catch (error: unknown) {
                        if (error instanceof Error && !error.message?.includes('ERR_ABORTED')) {
                            throw error;
                        }
                        const retweetedStatus = item.retweeted_status ? `<blockquote>${item.retweeted_status.user.screen_name}:&nbsp;${item.retweeted_status.description}</blockquote>` : '';
                        const description = item.description + retweetedStatus;

                        return {
                            title: item.title || sanitizeHtml(description, { allowedTags: [], allowedAttributes: {} }),
                            description: item.description,
                            pubDate: parseDate(item.created_at),
                            link: rootUrl + item.target,
                        };
                    }
                })
            )
        );

        return {
            title: `${data[0].user.screen_name} 的雪球${typename[type]}动态`,
            link,
            description: `${data[0].user.screen_name} 的雪球${typename[type]}动态`,
            item: items,
        };
    } finally {
        await browser.close();
    }
}
