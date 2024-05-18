import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { ofetch } from 'ofetch';
import { config } from '@/config';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/openai/news',
    name: 'News',
    maintainers: ['joeskj'],
    handler,
};

async function handler() {
    const data = await ofetch('https://openai.com/backend/pages/?sort=new', {
        headers: {
            Accept: '*/*',
            DNT: '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': config.trueUA,
        },
    });

    const items = data.items.map((item) => ({
        title: item.title,
        description: item.title,
        link: `https://openai.com/${item.slug}`,
        pubDate: parseDate(item.publicationDate),
        category: item.category.name,
    }));

    return {
        title: 'OpenAI News',
        link: 'https://openai.com/news',
        item: items,
    };
}
