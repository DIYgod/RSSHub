export interface Profile {
    id: string;
    url_token: string;
    name: string;
    use_default_avatar: boolean;
    avatar_url: string;
    avatar_url_template: string;
    is_org: boolean;
    type: string;
    url: string;
    user_type: string;
    headline: string;
    headline_render: string;
    gender: number;
    is_advertiser: boolean;
    ip_info: string;
    vip_info: {
        is_vip: boolean;
        vip_type: number;
        rename_days: string;
        entrance_v2: null;
        rename_frequency: number;
        rename_await_days: number;
    };
    badge: any[];
    badge_v2: {
        title: string;
        merged_badges: any[];
        detail_badges: any[];
        icon: string;
        night_icon: string;
    };
    allow_message: boolean;
    is_following: boolean;
    is_followed: boolean;
    is_blocking: boolean;
    follower_count: number;
    answer_count: number;
    articles_count: number;
    available_medals_count: number;
    employments: any[];
    is_realname: boolean;
    has_applying_column: boolean;
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
