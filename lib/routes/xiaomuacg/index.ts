import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';

export const route: Route = {
    path: '/',
    name: '最新文章',
    url: 'xiaomuacg.com',
    maintainers: ['xiaomuacg'],
    example: '/xiaomuacg',
    parameters: {},
    description: '小木游戏情报最新文章',
    categories: ['game'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xiaomuacg.com'],
            target: '/',
        },
    ],
    handler,
};

async function handler() {
    const baseUrl = 'https://xiaomuacg.com';

    try {
        // 获取网站的 RSS feed
        logger.http(`Fetching RSS feed from: ${baseUrl}/feed/`);
        const feedResponse = await ofetch(`${baseUrl}/feed/`);
        logger.info(`RSS feed response length: ${feedResponse.length}`);

        const $ = load(feedResponse, { xmlMode: true });

        // 检查 RSS 格式
        const channelTitle = $('channel > title').text();
        const itemCount = $('item').length;
        logger.info(`Channel title: ${channelTitle}, Item count: ${itemCount}`);

        if (itemCount === 0) {
            // 如果没有找到 item，尝试其他可能的结构
            const entries = $('entry').length; // Atom feed
            logger.info(`Atom entries count: ${entries}`);

            if (entries === 0) {
                throw new Error('No items or entries found in feed');
            }
        }

        // 解析 RSS 条目
        const list = $('item')
            .slice(0, 10) // 减少到10条
            .toArray()
            .map((item) => {
                const $item = $(item);
                const title = $item.find('title').text().trim();
                const link = $item.find('link').text().trim();
                const pubDate = $item.find('pubDate').text().trim();
                const description = $item.find('description').text().trim();

                logger.debug(`Processing item: ${title}`);

                return {
                    title: title || 'No title',
                    link: link || baseUrl,
                    pubDate: pubDate ? parseDate(pubDate) : new Date(),
                    category: $item
                        .find('category')
                        .toArray()
                        .map((cat) => $(cat).text()),
                    description: description || 'No description',
                };
            });

        logger.info(`Parsed list length: ${list.length}`);

        if (list.length === 0) {
            throw new Error('No valid items parsed from RSS feed');
        }

        const result = {
            title: channelTitle || '小木游戏情报 - 游戏、动漫资讯',
            link: baseUrl,
            description: '小木游戏情报最新文章',
            item: list,
        };

        logger.info(`Final result items count: ${result.item.length}`);
        return result;
    } catch (error) {
        logger.error(`Error in handler: ${error}`);

        // 提供一个备用方案，直接抓取网站首页
        try {
            logger.info('Trying to fetch homepage as fallback...');
            const response = await ofetch(baseUrl);
            const $ = load(response);

            // 尝试从首页提取文章链接
            const articles = $('article, .post, .entry').slice(0, 5);

            if (articles.length === 0) {
                throw new Error('No articles found on homepage');
            }

            const items = articles.toArray().map((article) => {
                const $article = $(article);
                const titleEl = $article.find('h1, h2, h3, .title, .post-title').first();
                const linkEl = $article.find('a').first();

                return {
                    title: titleEl.text().trim() || 'Untitled',
                    link: linkEl.attr('href') ? new URL(linkEl.attr('href'), baseUrl).href : baseUrl,
                    description: $article.text().slice(0, 200) + '...',
                    pubDate: new Date(),
                };
            });

            return {
                title: '小木游戏情报 - 独立动漫、游戏情报',
                link: baseUrl,
                description: 'XIAOMUACG（小木游戏情报）是一个独立运营的 ACG 情报博客，为二次元和游戏爱好者提供最新、可靠的资讯。无论是游戏上线动态、限时免费活动，还是各类大促信息，或是最新动漫作品的更新，都能通过本站点查阅。',
                item: items,
            };
        } catch (fallbackError) {
            logger.error(`Fallback also failed: ${fallbackError}`);
            throw new Error(`Both RSS and homepage parsing failed: ${error.message}`);
        }
    }
}
