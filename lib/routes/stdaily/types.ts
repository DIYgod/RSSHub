export interface DateListResponse {
    obj: {
        dateList: string[];
    };
}

export interface SectionListResponse {
    obj: {
        editionList: Array<{
            editionName: string;
            periodId: string;
            editionCode: string;
            id: string;
        }>;
    };
}

export interface ArticleListResponse {
    list: Array<{
        id: string;
    }>;
}

export interface ArticleDetailResponse {
    obj: {
        articleVo: {
            title: string;
            subtitle: string;
            content: string;
            editionName: string;
            picList: null | Array<{
                url: string;
                picText: string;
            }>;
            periodTime: string;
            author: string;
        };
    };
}
