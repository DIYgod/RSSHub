import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';

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
    date: string;
    img: string;
    user_name: string;
    fav: string;
    retweet: string;
    user_id: string;
    media_url: string;
    media_count: number;
    hashtags?: Record<string, unknown>;
    media_urls: MediaUrl[];
    score: string;
    rank: number;
}

export const processItems = (data: Tweet[], type: 'index' | 'illust' | 'manga'): DataItem[] =>
    data.map((item) => {
        const baseAuthorUrl = `https://skebetter.com/author/${item.user_id}`;
        const description = `
            <p>❤${item.fav}    🔁${item.retweet}</p>
            ${item.media_urls.map((media) => `<img src="${media.media_uri}" />`).join('')}
        `;

        if (type === 'manga') {
            return {
                title: item.text,
                description,
                author: item.user_name,
                link: `https://skebetter.com/series/${item.series_id}`,
            };
        }

        if (type === 'illust') {
            return {
                title: item.text,
                description,
                author: item.user_name,
                link: `${baseAuthorUrl}/illust/${item.id}`,
            };
        }

        // type === 'index'
        return {
            title: item.text,
            description,
            author: item.user_name,
            link: item.series_id ? `https://skebetter.com/series/${item.series_id}` : `${baseAuthorUrl}/manga/${item.id}`,
        };
    });

export const fetchData = async (url: string, isManga: boolean = false) => {
    const response = await ofetch(url);
    return isManga ? (response as Tweet[]) : (response.tweet as Tweet[]);
};
