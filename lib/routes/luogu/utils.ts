import { type CheerioAPI, load } from 'cheerio';
import MarkdownIt from 'markdown-it';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

interface LuoguUserData {
    user: {
        name: string;
        slogan: string;
        avatar: string;
    };
}

export const getPageData = <T>(response: string | CheerioAPI): T => {
    const $ = typeof response === 'string' ? load(response) : response;
    const data = $('script#lentille-context').text();
    if (!data) {
        throw new Error('Luogu page data is missing. The page may be unavailable or its format may have changed.');
    }
    return JSON.parse(data).data;
};

export const getUserInfoFromUID = (uid) =>
    cache.tryGet('luogu:username:' + uid, async () => {
        const response = await ofetch(`https://www.luogu.com/user/${uid}`, {
            query: {
                _contentOnly: 1,
            },
            responseType: 'text',
        });
        const { user } = getPageData<LuoguUserData>(response);

        return {
            name: user.name,
            description: user.slogan,
            avatar: user.avatar,
        };
    });

export interface LuoguArticle {
    lid: string;
    title: string;
    author: { name: string };
    time: number;
    content: string;
}

const md = MarkdownIt();

export const getArticleDescription = (link: string) =>
    cache.tryGet(link, async () => {
        const response = await ofetch(link, { responseType: 'text' });
        const { article } = getPageData<{ article: LuoguArticle }>(response);
        return md.render(article.content);
    });
