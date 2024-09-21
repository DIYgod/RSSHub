interface Article {
    addDate: string;
    author: string;
    channelId: number;
    content: string;
    externalUrl: string;
    firstPage: string;
    fromArticleId: number;
    fromChannelId: number;
    id: number;
    img2: string;
    imgUrl: string;
    isImg: number;
    summary: string;
    title: string;
    viewNum: number;
}

interface pageInf {
    currentPage: number;
    pageCount: number;
    pageSize: number;
    pageTotal: number;
}

export interface NewsInfo {
    code: number;
    data: {
        articles: Article[];
        pageInf: pageInf;
    };
    msg: string;
}

export interface NewsDetail {
    code: number;
    data: Article;
    msg: string;
}
