import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

interface PlayerOptions {
    link: string;
    image: string;
    flashplayer: string;
    width: string;
    height: string;
    aspectratio: string;
    title: string;
    description: string;
    autostart: boolean;
}

interface Element {
    index: number;
    href: string;
    relativeHref: string;
    text: string;
    thumbnailText: string;
    title: string;
    image: string;
    tags: string[];
    filterTags: string;
    publishDate: string;
    playerOptions: PlayerOptions;
    damSize: string;
    template: string;
    itemUrl: string;
    itemWidth: string;
    itemHeight: string;
    isPage: boolean;
    isVideo: boolean;
    itemVideoTranscriptLink: string;
}

export const route: Route = {
    path: '/strategyand/sustainability',
    categories: ['other'],
    example: '/pwc/strategyand/sustainability',
    radar: [
        {
            source: ['strategyand.pwc.com/at/en/functions/sustainability-strategy/publications.html', 'strategyand.pwc.com/'],
        },
    ],
    name: 'Sustainability',
    maintainers: ['mintyfrankie'],
    handler,
    url: 'strategyand.pwc.com/at/en/functions/sustainability-strategy/publications.html',
};

async function handler() {
    const baseUrl = 'https://www.strategyand.pwc.com/at/en/functions/sustainability-strategy/publications.html';
    const feedLang = 'en';
    const feedDescription = 'Sustainability Publications from PwC Strategy&';

    const response = await ofetch(
        'https://www.strategyand.pwc.com/content/pwc/03/en/functions/sustainability-strategy/publications/jcr:content/root/container/content-free-container/section_545483788/collection_v2.filter-dynamic.html',
        {
            query: {
                currentPagePath: '/content/pwc/03/en/functions/sustainability-strategy/publications',
                list: { menu_0: [] },
                defaultImagePath: '/content/dam/pwc/network/strategyand-collection-fallback-images',
            },
        }
    );
    const elements = JSON.parse(response.elements) as Element[];

    const items = elements.map((item) => ({
        title: item.title,
        link: item.href,
        pubDate: parseDate(item.publishDate, 'DD/MM/YY'),
        description: item.text,
        category: item.tags,
    }));

    // TODO: Add full text support

    return {
        title: 'PwC Strategy& - Sustainability Publications',
        link: baseUrl,
        language: feedLang,
        description: feedDescription,
        item: items,
    };
}
