interface Medal {
    id: number;
    name: string;
    image: string;
}

interface HeadFrame {
    id: number;
    image: string;
}

interface UsingItem {
    medal: Medal | null;
    head_frame: HeadFrame | null;
}

interface Relationship {
    status: number;
    that_status: number;
}

interface User {
    id: string;
    name: string;
    badge: any[];
    level: number;
    using_item: UsingItem;
    relationship: Relationship;
    boom_verified: number;
}

interface SafeSearch {
    racy: string;
    adult: string;
    spoof: string;
    medical: string;
    violence: string;
}

export interface Media {
    id: number;
    type: number;
    name: string;
    width: number;
    height: number;
    cover: string | null;
    status: string;
    safe_search: SafeSearch;
    unlock_item: null;
    media_url: string;
}

interface Group {
    id: number;
    name: string;
    type: number;
    god_id: string;
    status: number;
    privacy: number;
    layout_type: number;
    share_status: number;
    post_can_use_anonymous: boolean;
    approve_user_permission_status: number[];
}

interface Reward {
    money: number;
    diamond: number;
}

interface Post {
    id: number;
    user: User;
    title: string | null;
    content: string;
    appendix: object;
    created_time: number;
    expired_time: number;
    media: Media[];
    like: number;
    like_count: number;
    collection: number;
    top: number;
    reference_reply_count: number;
    reference_share_count: number;
    comment_count: number;
    group: Group;
    block_user: any[];
    tag_user_index: any[];
    reward: Reward;
    reference: null;
    latitude: number | null;
    longitude: number | null;
    unique_like_count: number;
    unique_exposure_count: number;
    unique_priority_point: number;
    unique_priority_time: string | null;
    safe_search: number;
    unlock_type: null;
    unlock_item: object;
    is_unlocked: null;
    visibility: number;
    is_anonymous: number;
    is_me: number;
    comment_can_use_anonymous: number;
    who_can_read: number;
    poll: null;
    activity: null;
    poll_status: null;
    is_cache: boolean;
    is_editor: boolean;
    theme_id: null;
}

export interface PostResponse {
    code: number;
    data: Post[];
}
