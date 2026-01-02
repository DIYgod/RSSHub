interface BaseItem {
    id: string;
    title: string;
    tags: string[];
    onlineTime: number;
    cover: string;
}

export interface InformationItem extends BaseItem {
    summary: string;
}

export interface ThesesItem extends BaseItem {
    authors: string[];
    content: string;
    journals: string[];
    publishDate: string;
    source: {
        sourceType: string;
    };
    subject: string;
    thesisTitle: string;
}

export interface ArticleItem extends BaseItem {
    columns: string[];
    source: {
        logo: string;
        sourceId: string;
        sourceName: string;
        sourceType: string;
    };
    summary: string;
    type: string;
}

export type SearchResultItem = InformationItem | ThesesItem | ArticleItem;

export interface ThesesDetailResponse {
    columns: string[];
    content: string;
    cover: string;
    enTextList: string[];
    id: string;
    journals: string[];
    link: string;
    onlineTime: number;
    original: boolean;
    paperList: Array<{
        authors: string[];
        checkname: string;
        doi: string;
        id: string;
        journal: string;
        link: string;
        publishDate: string;
        subjects: string[];
        summary: string;
        title: string;
        translateSummary: string;
        type: string;
    }>;
    relevant: Array<{
        timestamp: number;
        type: string;
    }>;
    source: {
        sourceId: string;
        sourceName: string;
    };
    sourceKey: string;
    sourceType: string;
    tags: string[];
    template: boolean;
    title: string;
    userType: number;
    zhTextList?: string[];
}

export interface InformationDetailResponse {
    columns: string[];
    content: string;
    cover: string;
    id: string;
    onlineTime: number;
    original: boolean;
    relevant: Array<{
        timestamp: number;
        type: string;
    }>;
    source: {
        sourceId: string;
        sourceName: string;
    };
    sourceKey: string;
    subject: string;
    summary: string;
    tags: string[];
    title: string;
    type: string;
}

export type DetailResponse = ThesesDetailResponse | InformationDetailResponse;
