import type { DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';

const author = '趣集';
const language = 'zh-CN';
const rootUrl = 'https://n.ifun.cool';

const processItems: (items: any[], limit: number) => DataItem[] = (items: any[], limit: number) =>
    items.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const description: string = item.content;
        const guid = `ifun-n-${item.id}`;

        const author: DataItem['author'] = item.author;

        return {
            title,
            description,
            pubDate: parseDate(item.createtime),
            link: item.id ? new URL(`articles/${item.id}`, rootUrl).href : undefined,
            category: [...new Set([item.category, item.tag].filter(Boolean))],
            author,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            language,
        };
    });

export { author, language, processItems, rootUrl };
