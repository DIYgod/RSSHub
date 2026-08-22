import Parser from 'rss-parser';

import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';

const parser = new Parser<Record<string, any>, Record<string, any>>({
    customFields: {
        item: ['letterboxd:filmTitle', 'letterboxd:watchedDate', 'letterboxd:rewatch', 'letterboxd:memberRating', 'letterboxd:memberLike'],
    },
    headers: {
        'User-Agent': config.ua,
    },
});

export async function getData(username: string, title: string) {
    const feed = await parser.parseURL(`https://letterboxd.com/${username}/rss/`);

    const item = feed.items
        .filter((entry) => entry['letterboxd:watchedDate'])
        .map((entry) => {
            const watchedDate = entry['letterboxd:watchedDate'];
            const rating = entry.title?.match(/[★½]+$/)?.[0] ?? '';

            let description = `<b>${entry['letterboxd:filmTitle']}</b><br />watched by ${username}<br />Date: ${new Date(watchedDate).toDateString()}<br />Rating: ${rating}`;
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
                pubDate: parseDate(watchedDate),
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
