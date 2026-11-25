import { load } from 'cheerio';

import type { DataItem } from '@/types';
import { parseDate } from '@/utils/time';

const author = '趣集';
const language = 'zh-CN';
const rootUrl = 'https://iread.life';
const apiRoot = 'https://api.iread.life';

const processItems: (items: any[], limit: number) => DataItem[] = (items: any[], limit: number) =>
    items.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        // The list API returns a summary only; the full story is split across pages on the site
        const description: string | undefined = item.summary ?? undefined;
        const guid = `ifun-n-${item.id}`;

        const author: DataItem['author'] = item.author;

        return {
            title,
            description,
            pubDate: parseDate(`${item.createtime}T00:00:00Z`),
            link: item.id ? new URL(`articles/${item.id}`, rootUrl).href : undefined,
            category: [...new Set([item.category, item.tag].filter(Boolean))],
            author,
            guid,
            id: guid,
            // Older stories have no summary
            content: description
                ? {
                      html: description,
                      text: load(description).text(),
                  }
                : undefined,
            language,
        };
    });

export { apiRoot, author, language, processItems, rootUrl };
