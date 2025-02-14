export interface NovelContent {
    id: string;
    title: string;
    description: string;
    content: string;

    userId: string;
    userName: string | null;

    bookmarkCount: number;
    viewCount: number;
    likeCount: number;

    createDate: Date;
    updateDate: Date | null;

    tags: string[];

    coverUrl: string;
    images: Record<string, string>;

    seriesId: string | null;
    seriesTitle: string | null;
}

export interface SFWNovelDetail {
    error: boolean;
    message: string;
    body: {
        bookmarkCount: number;
        commentCount: number;
        markerCount: number;
        createDate: string;
        uploadDate: string;
        description: string;
        id: string;
        title: string;
        likeCount: number;
        pageCount: number;
        userId: string;
        userName: string;
        viewCount: number;
        isOriginal: boolean;
        isBungei: boolean;
        xRestrict: number;
        restrict: number;
        content: string;
        coverUrl: string;
        suggestedSettings: {
            viewMode: number;
            themeBackground: number;
            themeSize: null;
            themeSpacing: null;
        };
        isBookmarkable: boolean;
        bookmarkData: null;
        likeData: boolean;
        pollData: null;
        marker: null;
        tags: {
            authorId: string;
            isLocked: boolean;
            tags: Array<{
                tag: string;
                locked: boolean;
                deletable: boolean;
                userId: string;
                userName: string;
            }>;
            writable: boolean;
        };
        seriesNavData: {
            seriesType: string;
            seriesId: number;
            title: string;
            isConcluded: boolean;
            isReplaceable: boolean;
            isWatched: boolean;
            isNotifying: boolean;
            order: number;
            next: {
                title: string;
                order: number;
                id: string;
                available: boolean;
            } | null;
            prev: null;
        } | null;
        descriptionBoothId: null;
        descriptionYoutubeId: null;
        comicPromotion: null;
        fanboxPromotion: null;
        contestBanners: any[];
        contestData: null;
        request: null;
        imageResponseOutData: any[];
        imageResponseData: any[];
        imageResponseCount: number;
        userNovels: {
            [key: string]: {
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
                bookmarkCount: number | null;
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
                seriesId?: string;
                seriesTitle?: string;
                isUnlisted: boolean;
            } | null;
        };
        hasGlossary: boolean;
        zoneConfig: {
            [key: string]: {
                url: string;
            };
        };
        extraData: {
            meta: {
                title: string;
                description: string;
                canonical: string;
                descriptionHeader: string;
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
            };
        };
        titleCaptionTranslation: {
            workTitle: null;
            workCaption: null;
        };
        isUnlisted: boolean;
        language: string;
        textEmbeddedImages: {
            [key: string]: {
                novelImageId: string;
                sl: string;
                urls: {
                    '240mw': string;
                    '480mw': string;
                    '1200x1200': string;
                    '128x128': string;
                    original: string;
                };
            };
        };
        commentOff: number;
        characterCount: number;
        wordCount: number;
        useWordCount: boolean;
        readingTime: number;
        genre: string;
        aiType: number;
        noLoginData: {
            breadcrumbs: {
                successor: any[];
                current: {
                    ja: string;
                };
            };
            zengoWorkData: {
                nextWork: {
                    id: string;
                    title: string;
                } | null;
                prevWork: {
                    id: string;
                    title: string;
                } | null;
            };
        };
    };
}

export interface NSFWNovelDetail {
    id: string;
    title: string;
    seriesId: string | null;
    seriesTitle: string | null;
    seriesIsWatched: boolean | null;
    userId: string;
    coverUrl: string;
    tags: string[];
    caption: string;
    cdate: string;
    rating: {
        like: number;
        bookmark: number;
        view: number;
    };
    text: string;
    marker: null;
    illusts: string[];
    images: {
        [key: string]: {
            novelImageId: string;
            sl: string;
            urls: {
                '240mw': string;
                '480mw': string;
                '1200x1200': string;
                '128x128': string;
                original: string;
            };
        };
    };
    seriesNavigation: {
        nextNovel: null;
        prevNovel: {
            id: number;
            viewable: boolean;
            contentOrder: string;
            title: string;
            coverUrl: string;
            viewableMessage: null;
        } | null;
    } | null;
    glossaryItems: string[];
    replaceableItemIds: string[];
    aiType: number;
    isOriginal: boolean;
}
