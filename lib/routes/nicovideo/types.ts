export interface UserInfo {
    id: number;
    nickname: string;
    icon: string;
    smallIcon: string;
}

interface Count {
    view: number;
    comment: number;
    mylist: number;
    like: number;
}

interface Thumbnail {
    url: string;
    middleUrl: string | null;
    largeUrl: string | null;
    listingUrl: string;
    nHdUrl: string;
}

interface Owner {
    ownerType: string;
    type: string;
    visibility: string;
    id: string;
    name: string;
    iconUrl: string;
}

export interface Essential {
    type: string;
    id: string;
    title: string;
    registeredAt: string;
    count: Count;
    thumbnail: Thumbnail;
    duration: number;
    shortDescription: string;
    latestCommentSummary: string;
    isChannelVideo: boolean;
    isPaymentRequired: boolean;
    playbackPosition: null;
    owner: Owner;
    requireSensitiveMasking: boolean;
    videoLive: null;
    isMuted: boolean;
}

export interface VideoItem {
    series: null;
    essential: Essential;
}
