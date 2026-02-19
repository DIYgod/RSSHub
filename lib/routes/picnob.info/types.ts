export type Pull = {
    request_hash: string;
};

export type Status = {
    type: 'account_info' | 'posts' | 'stories';
    status: 'in_progress' | 'success';
};

type BioLink = {
    url: string;
    lynxUrl: string;
    linkType: string;
    title: string;
    isPinned: boolean;
};

export type Profile = {
    user_id: string;
    isPrivate: boolean;
    isSubscribed: boolean;
    isBusiness: boolean;
    username: string;
    profilePicImageId: string;
    profilePicHdImageId: string;
    isVerified: boolean;
    postCount: number;
    followerCount: number;
    followingCount: number;
    highlightCount: number;
    bioLinks: BioLink[];
    biography: string;
    fullName: string;
};

type AlbumItem = {
    id: string;
    mediaType: 'image' | 'video';
    thumbnailImageUrl: string;
    videoUrl: string | null;
};

export type Post = {
    id: string;
    account_name: string;
    postType: 'carousel' | 'image' | 'video';
    takenAt: string;
    likeCount: number;
    thumbnailImageUrl: string;
    comments: any[];
    commentCount: number;
    commentsDisabled: boolean;
    videoUrl: string | null;
    viewVideoCount: null;
    text: string;
    albumItems: AlbumItem[];
};

export type Story = {
    account_name: string;
    takenAt: string;
    mediaType: 'image' | 'video';
    importedTakenAt: string;
    productType: string;
    thumbnailImageUrl: string;
    videoUrl: string | null;
    videoDuration: number | null;
    links: string[];
    hashtags: any[];
};
