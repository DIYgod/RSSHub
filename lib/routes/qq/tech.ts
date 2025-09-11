import { type Data, type DataItem, type Route, ViewType } from '@/types';
import { load } from 'cheerio';
import puppeteer from '@/utils/puppeteer';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { type Context } from 'hono';

const handler = async (ctx: Context): Promise<Data> => {
    const baseUrl = 'https://news.qq.com';
    const techUrl = `${baseUrl}/ch/tech/`;
    
    const browser = await puppeteer();
    const page = await browser.newPage();
    
    try {
        await page.goto(techUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // Wait for the news list to load
        await page.waitForSelector('.channel-feed-list', { timeout: 10000 });
        
        const html = await page.content();
        await browser.close();
        
        const $ = load(html);
        const items = [];
        
        $('.channel-feed-item').each((_, element) => {
            const $item = $(element);
            
            const titleElement = $item.find('.article-title-text');
            const linkElement = $item.find('.article-title');
            const imageElement = $item.find('.article-picture');
            const mediaElement = $item.find('.media-name');
            const timeElement = $item.find('.time');
            
            const title = titleElement.text().trim();
            const link = linkElement.attr('href');
            const image = imageElement.attr('src');
            const media = mediaElement.text().trim();
            const timeText = timeElement.text().trim();
            
            if (title && link) {
                // Parse relative time (e.g., "15小时前")
                let pubDate;
                if (timeText.includes('小时前')) {
                    const hours = parseInt(timeText.replace('小时前', ''));
                    pubDate = new Date(Date.now() - hours * 60 * 60 * 1000);
                } else if (timeText.includes('分钟前')) {
                    const minutes = parseInt(timeText.replace('分钟前', ''));
                    pubDate = new Date(Date.now() - minutes * 60 * 1000);
                } else {
                    pubDate = parseDate(timeText);
                }
                
                items.push({
                    title,
                    link: link.startsWith('http') ? link : `${baseUrl}${link}`,
                    description: image ? `<img src="${image}" alt="${title}"><br>${title}` : title,
                    author: media,
                    pubDate: pubDate?.toUTCString(),
                    guid: link,
                });
            }
        });
        
        return {
            title: '腾讯新闻科技频道',
            link: techUrl,
            description: '腾讯新闻科技频道最新资讯',
            item: items,
        };
    } catch (error) {
        await browser.close();
        throw error;
    }
};

export const route: Route = {
    path: '/tech',
    name: '腾讯新闻科技',
    maintainers: ['DIYgod'],
    handler,
    example: '/qq/tech',
    categories: ['new-media', 'popular'],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: `腾讯新闻科技频道`,
    radar: [
        {
            source: ['news.qq.com/ch/tech/'],
            target: '/qq/tech',
        },
    ],
    view: ViewType.Articles,
};