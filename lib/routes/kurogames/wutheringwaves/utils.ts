import type { Data } from '@/types';
import ofetch from '@/utils/ofetch';

import type { Article } from './constants';
import { Language, SUPPORTED_LANGUAGES } from './constants';

/**
 * Parse a number or a number as string.\
 * **NOTE:** this may return `NaN` if the string is not a number or the value is `undefined` and no {@link fallback} is provided.
 */
export const parseInteger = (value?: string | number, fallback?: number): number => {
    if (typeof value === 'number') {
        return value;
    }

    if (value === undefined) {
        return fallback === undefined ? NaN : fallback;
    }

    const parsed = Number.parseInt(value, 10);

    if (fallback !== undefined && Number.isNaN(parsed)) {
        return fallback;
    }

    return parsed;
};

/** Type-guard to ensure {@link language} is a valid value of {@link SUPPORTED_LANGUAGES}. */
export const isValidLanguage = (language: string): language is Language => SUPPORTED_LANGUAGES.includes(language as Language);

/** Fetch the articles for a given language in a given category. */
export const fetchArticles = (language: Language): Promise<Article[]> => {
    if (language === Language.Chinese) {
        return ofetch<Article[]>('https://media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/zh/ArticleMenu.json', { query: { t: Date.now() } });
    }

    return ofetch<{ article: Article[] }>(`https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/${language}/MainMenu.json`).then((data) => data.article);
};

/** Get the link to the article content. */
export const getArticleContentLink = (language: Language, articleId: number): string => {
    if (language === Language.Chinese) {
        return `https://media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/zh/article/${articleId}.json`;
    }

    return `https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/${language}/article/${articleId}.json`;
};

/** Get the link to an article from its ID. */
export const getArticleLink = (language: Language, articleId: number): string => {
    if (language === Language.Chinese) {
        return `https://mc.kurogames.com/main/news/detail/${articleId}`;
    }

    return `https://wutheringwaves.kurogames.com/${language}/main/news/detail/${articleId}`;
};

/** Resolve the handler language from the {@link Language}. */
export const getHandlerLanguage = (language: Language): Exclude<Data['language'], undefined> => {
    switch (language) {
        case Language.English:
            return 'en';
        case Language.Chinese:
            return 'zh-CN';
        case Language.ChineseTaiwan:
            return 'zh-TW';
        case Language.French:
            return 'fr';
        case Language.German:
            return 'de';
        case Language.Japanese:
            return 'ja';
        case Language.Korean:
            return 'ko';
        case Language.Spanish:
            return 'es';
        default:
            throw new Error(`Could not resolve handler language from "${language}"`);
    }
};
