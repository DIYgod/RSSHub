import { load } from 'cheerio';

import type { DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';

const author = '趣集';
const language = 'zh-CN';
const rootUrl = 'https://iread.life';
const apiRoot = 'https://api.iread.life';

const getRecords = (response) => {
    if (response?.code !== 200 || !Array.isArray(response.data?.list)) {
        throw new Error('iRead did not return an article list. Check whether the source API has changed.');
    }
    return response.data.list;
};

const processItems: (items: any[], limit: number) => DataItem[] = (items: any[], limit: number) =>
    items.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const description: string = item.content;
        const guid = `ifun-n-${item.id}`;

        const author: DataItem['author'] = item.author;
        const dateValue = item.createtime;
        const date = dateValue ? parseDate(/^\d{4}-\d{2}-\d{2}$/.test(dateValue) ? `${dateValue}T00:00:00Z` : dateValue) : undefined;

        return {
            title,
            description,
            pubDate: date && !Number.isNaN(date.getTime()) ? date : undefined,
            link: item.id ? new URL(`articles/${item.id}`, rootUrl).href : undefined,
            category: [...new Set([item.category, item.tag].filter(Boolean))],
            author,
            guid,
            id: guid,
            content: {
                html: description,
                text: load(description).text(),
            },
            language,
        };
    });

export { apiRoot, author, getRecords, language, processItems, rootUrl };
