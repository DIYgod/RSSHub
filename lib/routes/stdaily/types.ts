export interface DateListResponse {
    obj: {
        dateList: string[];
    };
}

export interface SectionListResponse {
    obj: {
        editionList: {
            editionName: string;
            periodId: string;
            editionCode: string;
            id: string;
        }[];
    };
}

export interface ArticleListResponse {
    list: {
        id: string;
    }[];
}

export interface ArticleDetailResponse {
    obj: {
        articleVo: {
            title: string;
            subtitle: string;
            content: string;
            editionName: string;
            picList:
                | null
                | {
                      url: string;
                      picText: string;
                  }[];
            periodTime: string;
            author: string;
        };
    };
}
