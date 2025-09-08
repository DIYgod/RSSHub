export interface Category {
    id: string;
    status: string;
    isMainCategory: boolean;
    code: string;
    nameJa: string;
    priority: number;
}

export interface CategoryArticle {
    description: string;
    id: string;
    mainCategory: Category;
    publishedAt: string | null;
    thumbnailUrl: string;
    title: string;
    isPr: boolean;
    content?: string;
    isVideoArticle?: boolean;
    subCategories?: Category[];
    redirectUrl?: string;
    iconImage?: string;
    advertiserName?: string;
    linkedUrl?: string;
}

interface Content {
    type: string;
    url: string;
    content: string | Content[] | string[];
    image_id?: number;
    path?: string;
}

export interface ArticleDetail {
    articleId: number;
    isR18: boolean;
    isDisplayAd: boolean;
    dept: {
        id: number;
        code: string;
        name_ja: string;
    };
    description: string;
    content: {
        page_no: number;
        contents: Content[];
        text: string;
    }[];
    mainCategories: Category;
    publishedAt: string;
    subCategories: Category[];
    thumbnailUrl: string;
    ogpImageUrl: string;
    title: string;
    updatedAt: string;
    user: {
        id: number;
        name_ja: string;
    };
    relatedArticles: {
        count: number;
        offset: number;
        page: number;
        limit: number;
        results: {
            id: string;
            article_type: string;
            main_category_ids: string[];
            sub_category_ids: string[];
            content_text: string;
            creation_time: string;
            creation_time_jst: string;
            dept_id: string;
            description: string;
            hide_on_top_page: string;
            is_pr: string;
            publication_time: string;
            publication_time_jst: string;
            is_r18: string;
            revision: string;
            importance_degree: string;
            thumbnail_caption: string;
            thumbnail_url: string;
            title: string;
            update_time: string;
            update_time_jst: string;
            user_id: string;
            status: string;
            has_video: string;
            tweet_id: string;
            game_ids: string[];
            author_ids: string[];
        }[];
    };
    authors: {
        id: number;
        icon_url: string;
        name_ja: string;
        description: string;
        relate_urls: any[];
    }[];
    redirectUrl: string;
    copyright: string;
    relatedLinks: {
        title: string;
        description: null;
        url: string;
        article: any[];
    }[];
    isToc: boolean;
    items: {
        status: string;
        item_id: string;
        item_type: string;
    }[];
}
