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
