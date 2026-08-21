export interface Profile {
    id: string;
    url_token: string;
    name: string;
    useDefaultAvatar: boolean;
    avatarUrl: string;
    avatarUrlTemplate: string;
    isOrg: boolean;
    type: string;
    url: string;
    userType: string;
    headline: string;
    headlineRender: string;
    gender: number;
    isAdvertiser: boolean;
    ipInfo: string;
    vipInfo: {
        isVip: boolean;
        vipType: number;
        renameDays: string;
        entranceV2: null;
        renameFrequency: number;
        renameAwaitDays: number;
    };
    badge: any[];
    badgeV2: {
        title: string;
        mergedBadges: any[];
        detailBadges: any[];
        icon: string;
        nightIcon: string;
    };
    allowMessage: boolean;
    isFollowing: boolean;
    isFollowed: boolean;
    isBlocking: boolean;
    followerCount: number;
    answerCount: number;
    articlesCount: number;
    availableMedalsCount: number;
    employments: any[];
    isRealname: boolean;
    hasApplyingColumn: boolean;
}

interface Article {
    image_url: string;
    updated: number;
    is_jump_native: boolean;
    is_labeled: boolean;
    copyright_permission: string;
    vessay_info: {
        enable_video_translate: boolean;
    };
    excerpt: string;
    admin_closed_comment: boolean;
    article_type: string;
    excerpt_title: string;
    reaction_instruction: {
        REACTION_CONTENT_SEGMENT_LIKE: string;
    };
    id: number;
    voteup_count: number;
    upvoted_followees: [];
    can_comment: {
        status: boolean;
        reason: string;
    };
    author: Profile;
    url: string;
    comment_permission: string;
    created: number;
    image_width: number;
    content: string;
    comment_count: number;
    linkbox: {
        url: string;
        category: string;
        pic: string;
        title: string;
    };
    title: string;
    voting: number;
    type: string;
    suggest_edit: {
        status: boolean;
        url: string;
        reason: string;
        tip: string;
        title: string;
    };
    is_normal: boolean;
}

export interface Articles {
    paging: {
        is_end: boolean;
        totals: number;
        previous: string;
        is_start: boolean;
        next: string;
    };
    data: Article[];
}

export interface CollectionItem {
    content: {
        type: string;
        title?: string;
        question?: {
            title: string;
        };
        url: string;
        content: string;
        video?: {
            url: string;
        };
        updated?: number;
        updated_time?: number;
    };
    collectionTitle?: string;
}

export interface Collection {
    id: string;
    title: string;
    creator: {
        name: string;
    };
}
