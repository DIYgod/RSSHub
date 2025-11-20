import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/research',
    categories: ['new-media'],
    example: '/netflix/research',
    radar: [
        {
            source: ['research.netflix.com/archive', 'research.netflix.com'],
        },
    ],
    name: 'Research',
    maintainers: ['TonyRL'],
    handler,
    url: 'research.netflix.com/',
};

const resolveArticle = (data, store) => {
    if (data === null) {
        return data;
    }

    if (typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map((item) => resolveArticle(item, store));
    }

    if (data.type === 'id') {
        const id = data.id;
        const target = store[id];
        return target === undefined ? null : resolveArticle(target, store);
    }

    const out = Array.isArray(data) ? [] : {};
    for (const [k, v] of Object.entries(data)) {
        out[k] = resolveArticle(v, store);
    }
    return out;
};

async function handler() {
    const baseUrl = 'https://research.netflix.com';
    const link = `${baseUrl}/archive`;
    const response = await ofetch(link);

    const $ = load(response);
    const nextData = JSON.parse($('#__NEXT_DATA__').text());
    const store = nextData.props.pageProps.serverState.apollo.data;

    const list = Object.values(store.ROOT_QUERY)
        .map((value) => resolveArticle(value, store))
        .flatMap((i) => i.items);

    const seen = new Set();
    const items = list
        .filter((item) => {
            const title = item.title.trim();
            if (seen.has(title)) {
                return false;
            }
            seen.add(title);
            return true;
        })
        .map((item) => ({
            title: item.title,
            description: item.description,
            link: item.link,
            pubDate: (item.date ?? item.startDate) ? parseDate(item.date ?? item.startDate) : undefined,
            category: item.tags?.json,
            image: item.image?.url,
        }));

    return {
        title: $('head title').text(),
        link,
        image: `${link}/favicon.ico`,
        item: items,
    };
}
