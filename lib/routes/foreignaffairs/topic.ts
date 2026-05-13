import type { Route, DataItem } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import { getArticleDetail } from './utils';

const TOPIC_MAP: Record<string, string> = {
    business: 'Business',
    'defense-military': 'Defense & Military',
    diplomacy: 'Diplomacy',
    'economic-development': 'Economic Development',
    economics: 'Economics',
    energy: 'Energy',
    geopolitics: 'Geopolitics',
    globalization: 'Globalization',
    ideology: 'Ideology',
    nato: 'NATO',
    'political-development': 'Political Development',
    'politics-society': 'Politics & Society',
    sanctions: 'Sanctions',
    'science-technology': 'Science & Technology',
    security: 'Security',
    trade: 'Trade',
    'trump-administration': 'Trump Administration',
    'us-foreign-policy': 'US Foreign Policy',
    'us-politics': 'US Politics',
};

export const route: Route = {
    path: '/topic/:topic',
    categories: ['traditional-media'],
    view: ViewType.Articles,
    example: '/foreignaffairs/topic/economics',
    parameters: {
        topic: {
            description: 'Topic slug or name. Available topics: ' + Object.keys(TOPIC_MAP).join(', ') + '. Can also use the display name directly (e.g., "Economics", "Politics & Society")',
            default: 'economics',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Topic',
    maintainers: ['dzx-dzx'],
    handler,
};

async function handler(ctx) {
    const topicParam = ctx.req.param('topic');

    // Accept both slug and display name
    const topicName = TOPIC_MAP[topicParam.toLowerCase()] || topicParam;
    const rssUrl = `https://www.foreignaffairs.com/feeds/topic/${encodeURIComponent(topicName)}/rss.xml`;

    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detail = await getArticleDetail(item.link!);
                return {
                    title: item.title!,
                    link: item.link,
                    pubDate: item.pubDate,
                    guid: item.guid || item.link,
                    author: detail.author || item.creator || '',
                    category: detail.category,
                    description: detail.description,
                    image: item.enclosure?.url,
                } satisfies DataItem;
            })
        )
    );

    return {
        title: `Foreign Affairs - ${topicName}`,
        link: rssUrl,
        description: feed.description || `Foreign Affairs articles on ${topicName}`,
        language: feed.language || 'en',
        item: items as DataItem[],
    };
}
