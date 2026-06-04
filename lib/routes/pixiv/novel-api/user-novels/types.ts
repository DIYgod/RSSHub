export interface SFWNovelsResponse {
    data: {
        error: boolean;
        message: string;
        body: {
            works: Record<string, SFWNovelWork>;
            extraData: {
                meta: {
                    title: string;
                    description: string;
                    canonical: string;
                    ogp: {
                        description: string;
                        image: string;
                        title: string;
                        type: string;
                    };
                    twitter: {
                        description: string;
                        image: string;
                        title: string;
                        card: string;
                    };
                    alternateLanguages: {
                        ja: string;
                        en: string;
                    };
                    descriptionHeader: string;
                };
            };
        };
    };
}

export interface SFWNovelWork {
    id: string;
    title: string;
    genre: string;
    xRestrict: number;
    restrict: number;
    url: string;
    tags: string[];
    userId: string;
    userName: string;
    profileImageUrl: string;
    textCount: number;
    wordCount: number;
    readingTime: number;
    useWordCount: boolean;
    description: string;
    isBookmarkable: boolean;
    bookmarkData: null;
    bookmarkCount: number;
    isOriginal: boolean;
    marker: null;
    titleCaptionTranslation: {
        workTitle: null;
        workCaption: null;
    };
    createDate: string;
    updateDate: string;
    isMasked: boolean;
    aiType: number;
    seriesId: string;
    seriesTitle: string;
    isUnlisted: boolean;
}

export interface NSFWNovelsResponse {
    data: {
        user: {
            id: number;
            name: string;
            account: string;
            profile_image_urls: {
                medium: string;
            };
            is_followed: boolean;
            is_access_blocking_user: boolean;
        };
        novels: NSFWNovelWork[];
    };
}

export interface NSFWNovelWork {
    id: string;
    title: string;
    caption: string;
    restrict: number;
    x_restrict: number;
    image_urls: {
        square_medium: string;
        medium: string;
        large: string;
    };
    create_date: string;
    tags: Array<{
        name: string;
        translated_name: string | null;
        added_by_uploaded_user: boolean;
    }>;
    text_length: number;
    user: {
        id: number;
        name: string;
        account: string;
        profile_image_urls: {
            medium: string;
        };
    };
    series?: {
        id?: number;
        title?: string;
    };
    total_bookmarks: number;
    total_view: number;
    total_comments: number;
}

export interface NovelList {
    title: string;
    description: string;
    image: string;
    link: string;
    item: Array<{
        title: string;
        description: string;
        author: string;
        pubDate: Date;
        link: string;
        category: string[];
    }>;
}
