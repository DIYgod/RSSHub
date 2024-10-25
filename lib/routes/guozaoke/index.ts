import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import { config } from '@/config';
import logger from '@/utils/logger';
import cache from '@/utils/cache';

export const route: Route = {
    path: '',
    categories: ['bbs'],
    example: '/guozaoke',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'guozaoke',
    maintainers: ['xiaoshame'],
    handler,
    url: 'guozaoke.com/',
};

interface Item {
    title: string;
    link: string;
    author: string;
    time: string;
}

interface ProcessedItem {
    title: string;
    link: string;
    pubDate: string;
    description: string;
    author: string;
}

async function getContent(link) {
    const url = `https://www.guozaoke.com${link}`;
    const res = await got({
        method: 'get',
        url,
        headers: {
            Cookie: config.guozaoke.cookies,
            'User-Agent': config.ua,
        },
    });

    const $ = load(res.data);
    let content = $('div.ui-content').html();
    content = content ? content.trim() : '';
    const comments = $('.reply-item').map((i, el) => {
        const $el = $(el);
        const comment = $el.find('span.content').text().trim();
        const author = $el.find('span.username').text();
        return {
            comment,
            author,
        };
    });
    if (comments && comments.length > 0) {
        for (const item of comments) {
            content += '<br>' + item.author + ': ' + item.comment;
        }
    }

    return content;
}

async function fetchContent(item: Item): Promise<ProcessedItem | null> {
    return await cache.tryGet(item.link, async () => {
        try {
            const content = await getContent(item.link);
            if (content === undefined || content === '') {
                return null; // 如果内容为空，则返回null
            }
            return {
                title: item.title,
                link: item.link,
                pubDate: parseDate(item.time),
                description: content,
                author: item.author,
            };
        } catch (error) {
            logger.error(error);
            return null; // 如果发生错误，则返回null
        }
    });
}

// 递归处理函数，每次处理一批项
async function processBatch(items: Item[], batchSize: number, out: ProcessedItem[], startIndex: number): Promise<ProcessedItem[]> {
    if (startIndex >= items.length) {
        // 所有项都已处理完毕，返回结果
        return out;
    }

    // 确定这一批要处理的项数
    const endIndex = Math.min(startIndex + batchSize, items.length);
    const batchItems = items.slice(startIndex, endIndex);

    // 创建这一批的 Promise 数组
    const batchPromises = batchItems.map((item) => fetchContent(item));

    // 等待这一批 Promise 完成，并过滤结果
    const results = await Promise.all(batchPromises);
    const filteredResults = results.filter((result): result is ProcessedItem => result !== null);

    // 将过滤后的结果添加到输出数组中
    out.push(...filteredResults);

    // 递归处理下一批项
    return processBatch(items, batchSize, out, endIndex);
}

function processItems(itemsToFetch: Item[]): Promise<ProcessedItem[]> {
    const batchSize = 2; // 并发请求的数量
    const out: ProcessedItem[] = [];
    return processBatch(itemsToFetch, batchSize, out, 0);
}

async function handler() {
    const url = `https://www.guozaoke.com/`;
    const res = await got({
        method: 'get',
        url,
        headers: {
            Cookie: config.guozaoke.cookies,
            'User-Agent': config.ua,
        },
    });
    const $ = load(res.data);

    const list = $('div.topic-item').toArray();
    const maxItems = 20; // 最多取20个数据

    const itemsToFetch: Item[] = list
        .slice(0, maxItems)
        .map((item) => {
            const $item = $(item);
            const title = $item.find('h3.title a').text();
            const link = $item.find('h3.title a').attr('href');
            const author = $item.find('span.username a').text();
            const lastTouched = $item.find('span.last-touched').text();
            const time = parseRelativeDate(lastTouched);
            return link ? { title, link, author, time } : undefined;
        })
        .filter((item) => item !== undefined);

    const out = await processItems(itemsToFetch);

    return {
        title: '过早客',
        link: url,
        item: out,
    };
}
