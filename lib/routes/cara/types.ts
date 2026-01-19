export interface UserNextData {
    pageProps: {
        user: {
            id: string;
            name: string;
            slug: string;
            photo: string;
        };
    };
}

export interface PortfolioResponse {
    data: Array<{
        url: string;
        postId: string;
        imageNum: number;
    }>;
}

export interface PortfolioDetailResponse {
    data: {
        createdAt: string;
        images: Array<{
            src: string;
            isCoverImg: boolean;
        }>;
        title: string;
        content: string;
    };
}

export interface PostsResponse {
    data: Array<{
        name: string;
        photo: string;
        createdAt: string;
        images: Array<{
            src: string;
            isCoverImg: boolean;
        }>;
        id: string;
        title: string;
        content: string;
    }>;
}
