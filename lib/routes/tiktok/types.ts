export type EmbedUser = {
    id: string;
    avatarThumbUrl: string;
    uniqueId: string;
    verified: boolean;
    followingCount: number;
    followerCount: number;
    heartCount: number;
    signature: string;
    privateAccount: boolean;
    nickname: string;
    code: number;
    customErrorCode: number;
};

export type EmbedVideo = {
    id: string;
    desc: string;
    height: number;
    width: number;
    ratio: string;
    coverUrl: string;
    originCoverUrl: string;
    dynamicCoverUrl: string;
    playAddr: string;
    playCount: number;
    privateItem: boolean;
    authorUniqueId: string;
};
