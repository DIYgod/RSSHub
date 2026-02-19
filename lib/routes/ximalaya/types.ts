interface Track {
    trackId: number;
    trackRecordId: number;
    uid: number;
    playUrl64: string;
    playUrl32: string;
    playPathAacv164: string;
    playPathAacv224: string;
    playPathHq: string;
    title: string;
    duration: number;
    albumId: number;
    albumTitle: string;
    isPaid: boolean;
    isFree: boolean;
    isVideo: boolean;
    isDraft: boolean;
    isAuthorized: boolean;
    priceTypeId: number;
    sampleDuration: number;
    priceTypeEnum: number;
    type: number;
    relatedId: number;
    orderNo: number;
    isHoldCopyright: boolean;
    vipFirstStatus: number;
    paidType: number;
    isSample: boolean;
    ximiFirstStatus: number;
    coverLarge: string;
    permissionSource: string;
    playtimes: number;
    labelType: number;
    processState: number;
    createdAt: number;
    coverSmall: string;
    coverMiddle: string;
    nickname: string;
    smallLogo: string;
    userSource: number;
    opType: number;
    isPublic: boolean;
    likes: number;
    comments: number;
    shares: number;
    status: number;
    videoCover: string;
    intro: string;
    labelList: string[];
    isTrailer: number;
}

export interface TrackInfoResponse {
    msg: string;
    ret: number;
    data: {
        list: Track[];
        pageId: number;
        pageSize: number;
        maxPageId: number;
        totalCount: number;
    };
}

export interface RichIntro {
    ret: number;
    richIntro: string;
}

interface SubscriptInfo {
    albumSubscriptValue: number;
    url: string;
}

export interface Album {
    anchorUid: number;
    albumStatus: number;
    showApplyFinishBtn: boolean;
    showEditBtn: boolean;
    showTrackManagerBtn: boolean;
    showInformBtn: boolean;
    cover: string;
    albumTitle: string;
    updateDate: string;
    createDate: string;
    playCount: number;
    isPaid: boolean;
    isFinished: number;
    isSubscribe: boolean;
    richIntro: string;
    shortIntro: string;
    detailRichIntro: string;
    isPublic: boolean;
    hasBuy: boolean;
    vipType: number;
    canCopyText: boolean;
    subscribeCount: number;
    sellingPoint: object;
    personalDescription: string;
    bigshotRecommend: string;
    outline: string;
    customTitle: string;
    produceTeam: string;
    recommendReason: string;
    subscriptInfo: SubscriptInfo;
    albumSubscript: number;
    tags: string[];
    categoryId: number;
    ximiVipFreeType: number;
    joinXimi: boolean;
    freeExpiredTime: number;
    categoryTitle: string;
    anchorName: string;
    albumSeoTitle: string;
    visibleStatus: number;
}
