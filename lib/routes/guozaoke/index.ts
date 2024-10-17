import { Route } from '@/types';
import got from '@/utils/got';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import logger from '@/utils/logger';

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
    time: Date;
}

interface ProcessedItem {
    title: string;
    link: string;
    pubDate: Date;
    description: string;
    author: string;
}

function convertToDate(relativeTime: string) {
    const minutesAgoMatch = relativeTime.match(/\d+/);
    const minutesAgo = minutesAgoMatch ? Number.parseInt(minutesAgoMatch[0], 10) : 0;
    const now: number = Date.now();
    const pastDate = new Date(now - minutesAgo * 60 * 1000); // Subtract minutes in milliseconds
    return pastDate;
}

async function getContent(link) {
    const url = `https://www.guozaoke.com${link}`;
    const cookie = config.guozaoke.cookies;
    const res = await got({
        method: 'get',
        url,
        headers: {
            Cookie: cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        },
    });

    const $ = cheerio.load(res.data);
    let content = $('div.ui-content').html();
    content = content ? content.trim() : '';
    const comments = $('.reply-item')
        .map((i, el) => {
            const $el = $(el);
            return {
                comment: $el.find('span.content').text().trim(), // 提取content内容并去除前后空格
                author: $el.find('span.username').text(), // 提取username
            };
        })
        .get();
    if (comments && comments.length > 0) {
        for (const item of comments) {
            content += '<br>' + item.author + ': ' + item.comment;
        }
    }

    return content ? content : '';
}

async function fetchContent(item: Item): Promise<ProcessedItem | null> {
    try {
        const content = await getContent(item.link);
        if (content === '') {
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
}
async function processItems(itemsToFetch: Item[]): Promise<ProcessedItem[]> {
    const out: ProcessedItem[] = [];
    let currentIndex = 0;

    // 使用索引直接访问原始数组，避免不必要的 slice 操作（可选优化）
    const batchPromises: Promise<ProcessedItem | null>[] = [];
    for (let i = 0; i < 10 && currentIndex < itemsToFetch.length; i++, currentIndex++) {
        batchPromises.push(fetchContent(itemsToFetch[currentIndex]));
    }
    const results = await Promise.all(batchPromises);
    out.push(...results.filter((result): result is ProcessedItem => result !== null));

    return out;
}

async function handler() {
    const url = `https://www.guozaoke.com/`;
    const res = await got.get(url);
    const $ = cheerio.load(res.body);

    const list = $('div.topic-item');
    const itemsToFetch: Item[] = [];
    const maxItems = 10; // 最多取10个数据

    for (const item of list) {
        if (itemsToFetch.length >= maxItems) {
            break;
        }
        const $item = $(item);
        const title = $item.find('h3.title a').text();
        const link = $item.find('h3.title a').attr('href');
        const author = $item.find('span.username a').text();
        const lastTouched = $item.find('span.last-touched').text();
        const time = convertToDate(lastTouched);
        if (link) {
            itemsToFetch.push({ title, link, author, time });
        }
    }

    const out = await processItems(itemsToFetch);

    return {
        title: `过早客`,
        link: url,
        item: out,
    };
}
