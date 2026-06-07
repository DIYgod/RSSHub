export interface AnnouncementsConfig {
    title: string;
    description: string;
    url: string;
    imgUrl: string;
}

export interface AnnouncementCatalog {
    articles: AnnouncementArticle[];
    catalogId: number;
    catalogName: string;
    catalogType: 1;
    catalogs: [];
    description: null;
    icon: string;
    parentCatalogId: null;
    total: number;
}

export interface AnnouncementArticle {
    id: number;
    code: string;
    title: string;
    type: number;
    releaseDate: number;
}

export type SquareFilterType = 'ALL' | 'QUOTE' | 'LIVE';

export interface SquareTranslatedData {
    title?: string | null;
    content?: string | null;
    body?: string | null;
    bodyTextOnly?: string | null;
}

export interface SquareImageMeta {
    url: string;
    width?: number;
    height?: number;
}

export interface SquareQuoteContent {
    id?: string;
    title?: string;
    bodyTextOnly?: string;
    webLink?: string;
    imageLink?: string;
    coverMeta?: SquareImageMeta | null;
    translatedData?: SquareTranslatedData | null;
}

export interface SquarePost {
    id: number;
    title?: string;
    bodyTextOnly?: string;
    contentType?: number;
    createTime?: number;
    webLink?: string;
    displayName?: string;
    imageList?: string[];
    imageMetaList?: SquareImageMeta[];
    coverMeta?: SquareImageMeta | null;
    hashtagList?: string[];
    quoteContent?: SquareQuoteContent | null;
    translatedData?: SquareTranslatedData | null;
    commentCount?: number;
    likeCount?: number;
}

export interface SquarePostsResponse {
    code: string;
    message?: string | null;
    data: {
        contents?: SquarePost[];
        timeOffset?: number;
    } | null;
    success?: boolean;
}

export interface SquareUserProfile {
    squareUid?: string | null;
    avatar?: string | null;
    displayName?: string | null;
    biography?: string | null;
    username?: string | null;
}

export interface SquareUserProfileResponse {
    code: string;
    data: SquareUserProfile | null;
    success?: boolean;
}
