import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/explore',
    categories: ['social-media'],
    example: '/douban/explore',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '浏览发现',
    maintainers: ['clarkzsd'],
    handler,
};

interface ExploreTarget {
    title?: string;
    abstract?: string;
    uri: string;
    url?: string;
    create_time?: string;
    owner?: { name: string; type: string };
    author?: { name: string };
    gallery_topic?: { name: string };
    photos?: Array<{ large?: { url: string }; normal?: { url: string } }>;
}

async function handler() {
    const link = 'https://www.douban.com/explore';
    const response = await ofetch<{ items: Array<{ target: ExploreTarget }> }>('https://m.douban.com/rexxar/api/v2/popular_creator/records', {
        query: { start: 0, count: 20 },
        headers: { Referer: link },
    });

    return {
        title: '豆瓣-浏览发现',
        link,
        sortItems: false,
        item: response.items.map(({ target }) => ({
            title: target.title || target.abstract || '',
            author: target.author?.name || (target.owner?.type === 'user' ? target.owner.name : undefined),
            description: renderDescription(target),
            pubDate: target.create_time ? timezone(parseDate(target.create_time), 8) : undefined,
            category: target.gallery_topic?.name ? [target.gallery_topic.name] : undefined,
            link: target.url || `https://www.douban.com/doubanapp/dispatch?uri=${encodeURIComponent(target.uri.replace('douban://douban.com', ''))}`,
        })),
    };
}

const renderDescription = ({ abstract, photos }: ExploreTarget): string =>
    renderToString(
        <>
            {abstract ? <p>{abstract}</p> : null}
            {photos?.map((photo) => {
                const image = photo.large?.url || photo.normal?.url;
                return image ? <img src={image} /> : null;
            })}
        </>
    );
