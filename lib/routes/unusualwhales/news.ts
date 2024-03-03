// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const apiBase = 'https://phx.unusualwhales.com';

export default async (ctx) => {
    const { data } = await got(`${apiBase}/api/fj_articles`);

    const items = data.map((item) => ({
        title: item.title,
        description: item.description,
        link: item.url,
        pubDate: parseDate(item.publish_date),
    }));

    ctx.set('data', {
        title: 'Flow - News',
        description: 'Explore unusual options, options flow, dark pools, short activity, and stock activity on unusualwhales.com. Unusual whales has a full news service available!',
        link: 'https://unusualwhales.com/news-feed',
        image: 'https://unusualwhales.com/android-icon-192x192.png',
        language: 'en-US',
        item: items,
    });
};
