/** The language. */
export enum Language {
    English = 'en',
    Japanese = 'jp',
    Korean = 'kr',
    /** Legacy code to ensure old results don't change. */
    Chinese = 'zh',
    ChineseTaiwan = 'zh-tw',
    Spanish = 'es',
    French = 'fr',
    German = 'de',
}

/** Route parameters. */
export enum Parameter {
    Limit = 'limit',
    Language = 'language',
}

/** The languages supported by the API. */
export const SUPPORTED_LANGUAGES = Object.values(Language);

export interface Article {
    articleContent: string;
    articleDesc: string;
    articleId: number;
    articleTitle: string;
    articleType: number;
    createTime: string;
    sortingMark: number;
    startTime: string;
    suggestCover: string;
    top: number;
}
