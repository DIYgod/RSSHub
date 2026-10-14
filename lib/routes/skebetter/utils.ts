import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

export interface MediaUrl {
    h: number;
    w: number;
    sh: number;
    sw: number;
    type: string;
    media_id: string | null;
    media_uri: string;
    media_index: number;
}

export interface Tweet {
    id: string;
    screen_name: string;
    series_id?: number;
    text: string;
    date?: string | null;
    img: string;
    user_name: string;
    fav: string;
    retweet: string;
    user_id: string;
    media_url: string;
    media_count: number;
    media_urls: MediaUrl[];
    score: string;
    rank: number;
}

export const processItems = (data: Tweet[], type: 'index' | 'illust' | 'manga'): DataItem[] =>
    data.map((item) => {
        const title = item.text || `${item.user_name} (${item.id})`;
        const baseAuthorUrl = `https://skebetter.com/author/${item.user_id}`;
        const description = `
            <p>❤${item.fav}    🔁${item.retweet}</p>
            ${item.media_urls.map((media) => `<img src="${media.media_uri}" />`).join('')}
        `;

        if (type === 'manga') {
            return {
                title,
                description,
                author: item.user_name,
                link: `https://skebetter.com/series/${item.series_id}`,
                pubDate: parseTweetDate(item.date),
            };
        }

        if (type === 'illust') {
            return {
                title,
                description,
                author: item.user_name,
                link: `${baseAuthorUrl}/illust/${item.id}`,
                pubDate: parseTweetDate(item.date),
            };
        }

        // type === 'index'
        return {
            title,
            description,
            author: item.user_name,
            link: item.series_id ? `https://skebetter.com/series/${item.series_id}` : `${baseAuthorUrl}/manga/${item.id}`,
            pubDate: parseTweetDate(item.date),
        };
    });

const relativeUnits = { 時間: 'hours', 日: 'days', 週間: 'weeks' };

const parseTweetDate = (date?: string | null): Date | undefined => {
    const match = date?.match(/^(\d+)(時間|日|週間)前$/);
    return match ? parseRelativeDate(`${match[1]} ${relativeUnits[match[2]]} ago`) : undefined;
};

export const fetchData = async (url: string, isManga: boolean = false): Promise<Tweet[]> => {
    if (isManga) {
        return await ofetch<Tweet[]>(url);
    }
    const response = await ofetch<{ tweet: Tweet[] }>(url);
    return response.tweet;
};
