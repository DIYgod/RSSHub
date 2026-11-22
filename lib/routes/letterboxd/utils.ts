import Parser from 'rss-parser';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { formatDate, parseDate } from '@/utils/time';

type LetterboxdItem = {
    'letterboxd:filmTitle': string;
    'letterboxd:watchedDate': string;
    'letterboxd:rewatch': string;
    'letterboxd:memberRating': string;
    'letterboxd:memberLike': string;
};

export async function getData(username: string, title: string) {
    const parser = new Parser<object, LetterboxdItem>({
        customFields: {
            item: ['letterboxd:filmTitle', 'letterboxd:watchedDate', 'letterboxd:rewatch', 'letterboxd:memberRating', 'letterboxd:memberLike'],
        },
    });
    const feedUrl = `https://letterboxd.com/${username}/rss/`;
    const feed = await cache.tryGet(feedUrl, async () => parser.parseString(await ofetch(feedUrl, { responseType: 'text' })));

    const item = feed.items
        .filter((entry) => entry['letterboxd:watchedDate'])
        .map((entry) => {
            const watchedDate = parseDate(entry['letterboxd:watchedDate']);
            const rating = entry.title?.match(/[★½]+$/)?.[0] ?? '';

            let description = `Date: ${watchedDate && formatDate(watchedDate, 'ddd MMM DD YYYY')}<br />Rating: ${rating}`;
            if (entry['letterboxd:memberLike'] === 'Yes') {
                description += '<br />Liked';
            }
            if (entry['letterboxd:rewatch'] === 'Yes') {
                description += '<br />Rewatch';
            }
            description += `<br />${entry.content}`;

            return {
                title: entry['letterboxd:filmTitle'],
                link: entry.link,
                author: username,
                guid: entry.link,
                pubDate: entry.pubDate ? parseDate(entry.pubDate) : undefined,
                description,
            };
        });

    return {
        title,
        link: `https://letterboxd.com/${username}/diary/`,
        description: feed.description,
        item,
    };
}
