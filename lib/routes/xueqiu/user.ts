import { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import sanitizeHtml from 'sanitize-html';
import { parseToken } from '@/routes/xueqiu/cookies';
import logger from '@/utils/logger';
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
        const page = await browser.newPage();

        // 设置更真实的浏览器特征
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        });

        // 设置必要的 headers
        await page.setExtraHTTPHeaders({
            Cookie: token as string,
            Referer: link,
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'max-age=0',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
        });

        // 启用 JavaScript
        await page.setJavaScriptEnabled(true);

        // 访问页面
        await page.goto(link, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        // 模拟滚动
        await page.evaluate(() => {
            window.scrollBy(0, 300);
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 直接访问 API
        const apiUrl = `${rootUrl}/v4/statuses/user_timeline.json?user_id=${id}&type=${type}`;
        const response = await page.goto(apiUrl, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        if (!response) {
            throw new Error('Failed to get API response');
        }

        let responseData;
        try {
            responseData = await response.json();
        } catch (error) {
            logger.error('Error parsing JSON response:', error);
            throw new Error('Failed to parse user timeline data');
        }

        if (!responseData || !responseData.statuses) {
            logger.error('Invalid response data:', responseData);
            throw new Error('Invalid user timeline data received');
        }

        const data = responseData.statuses.filter((s) => s.mark !== 1); // 去除置顶动态

        if (!data.length) {
            throw new Error('No valid timeline data found');
        }

        const items = await Promise.all(
            data.map((item) =>
                cache.tryGet(item.target, async () => {
                    // 访问详情页
                    const detailPage = await browser.newPage();
                    try {
                        await detailPage.setExtraHTTPHeaders({
                            Cookie: token as string,
                            Referer: link,
                        });

                        const detailUrl = rootUrl + item.target;
                        await detailPage.goto(detailUrl, {
                            waitUntil: 'networkidle0',
                            timeout: 30000,
                        });

                        // 等待页面内容加载
                        await detailPage
                            .waitForFunction(
                                () => {
                                    const content = document.querySelector('.article__bd');
                                    return content !== null;
                                },
                                { timeout: 5000 }
                            )
                            .catch(() => {
                                logger.debug(`Wait timeout: ${detailUrl}`);
                            });

                        // 获取详情页内容
                        const content = await detailPage.evaluate(() => {
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
                    } catch (error) {
                        logger.error(`Error fetching detail page: ${error}`);
                        // 如果获取详情页失败，返回基本信息
                        return {
                            title: item.title || sanitizeHtml(item.description, { allowedTags: [], allowedAttributes: {} }),
                            description: item.description,
                            pubDate: parseDate(item.created_at),
                            link: rootUrl + item.target,
                        };
                    } finally {
                        await detailPage.close();
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
