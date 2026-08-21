export interface Social {
    website?: string;
    x?: string;
    linkedin?: string;
    instagram?: string;
}

export interface Author {
    first_name: string;
    last_name: string;
    preferred_username: string;
    web_site: string;
    email: string;
    picture: string;
    bio: string;
    sub: string;
    groups: string;
    badge?: string;
    rcv_mail: boolean;
    rcv_push: boolean;
    key?: string;
    bookmarks?: string;
    following?: string;
    followers: number;
    posts: number;
    views: number;
    wviews: number;
    eviews: number;
    imps: number;
    wimps: number;
    eimps: number;
    social: Social;
}

export interface Post {
    pid: number;
    uid: string;
    completed: number;
    step: number;
    status: string;
    curated: boolean;
    headline: string;
    link: string;
    image: string;
    webp_image: string;
    preview_image: string;
    cropper_data: string;
    description: string;
    category: string;
    tags: string[];
    feeds?: string[];
    dataset: string;
    dataset_settings: string;
    sources: string[];
    note: string;
    comments: number;
    views: number;
    wviews: number;
    eviews: number;
    imps: number;
    wimps: number;
    eimps: number;
    commented: number;
    shares: number;
    bookmarks: number;
    likes: number;
    cools: number;
    loves: number;
    debatables: number;
    insightfuls: number;
    created_at: number;
    updated_at: number;
    author: Author;
    subscribe_vc: boolean;
    sponsored: boolean;
    pinned: boolean;
    published_at: number;
}
