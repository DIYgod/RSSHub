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
        antiCrawler: true, // 改为true，因为网站有反爬虫机制
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
    
    // 添加请求头配置
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': baseUrl,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Upgrade-Insecure-Requests': '1'
    };

    try {
        // 首先尝试获取网站的 RSS feed
        logger.http(`Fetching RSS feed from: ${baseUrl}/feed/`);
        const feedResponse = await ofetch(`${baseUrl}/feed/`, {
            headers,
            timeout: 10000,
            retry: 2,
            retryDelay: 1000
        });
        
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
            .slice(0, 10)
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
        logger.error(`Error in RSS handler: ${error}`);

        // 提供备用方案，直接抓取网站首页
        try {
            logger.info('RSS failed, trying to fetch homepage as fallback...');
            const response = await ofetch(baseUrl, {
                headers,
                timeout: 10000,
                retry: 2,
                retryDelay: 1000
            });
            
            const $ = load(response);

            // 尝试多种选择器来找到文章
            let articles = $('article').slice(0, 10);
            
            if (articles.length === 0) {
                articles = $('.post, .entry, .content-item, .item, .news-item').slice(0, 10);
            }
            
            if (articles.length === 0) {
                // 如果还是找不到，尝试查找包含链接的元素
                articles = $('div:has(h1), div:has(h2), div:has(h3)').slice(0, 10);
            }

            if (articles.length === 0) {
                throw new Error('No articles found on homepage');
            }

            const items = articles.toArray().map((article, index) => {
                const $article = $(article);
                
                // 尝试多种方式找标题
                let titleEl = $article.find('h1, h2, h3, .title, .post-title, .entry-title').first();
                if (!titleEl.length) {
                    titleEl = $article.find('a').first();
                }
                
                // 尝试多种方式找链接
                let linkEl = $article.find('a').first();
                if (!linkEl.length) {
                    linkEl = $article.find('h1 a, h2 a, h3 a').first();
                }
                
                const title = titleEl.text().trim() || `文章 ${index + 1}`;
                const link = linkEl.attr('href') ? new URL(linkEl.attr('href'), baseUrl).href : baseUrl;
                
                // 尝试获取描述
                let description = $article.find('.excerpt, .summary, .content, p').first().text().trim();
                if (!description) {
                    description = $article.text().slice(0, 200).trim();
                }
                
                // 尝试获取日期
                let pubDate = new Date();
                const dateText = $article.find('.date, .time, .published, time').first().text().trim();
                if (dateText) {
                    try {
                        pubDate = parseDate(dateText);
                    } catch (e) {
                        logger.debug(`Failed to parse date: ${dateText}`);
                    }
                }

                return {
                    title,
                    link,
                    description: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
                    pubDate,
                };
            });

            if (items.length === 0) {
                throw new Error('No valid items parsed from homepage');
            }

            logger.info(`Fallback parsed ${items.length} items`);

            return {
                title: '小木游戏情报 - 独立动漫、游戏情报',
                link: baseUrl,
                description: 'XIAOMUACG（小木游戏情报）是一个独立运营的 ACG 情报博客，为二次元和游戏爱好者提供最新、可靠的资讯。',
                item: items,
            };
        } catch (fallbackError) {
            logger.error(`Fallback also failed: ${fallbackError}`);
            
            // 最终fallback：返回基本信息
            return {
                title: '小木游戏情报',
                link: baseUrl,
                description: '暂时无法获取最新文章，请稍后再试。',
                item: [{
                    title: '网站暂时无法访问',
                    link: baseUrl,
                    description: `访问出现问题：${error.message}`,
                    pubDate: new Date(),
                }],
            };
        }
    }
}
