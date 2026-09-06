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

export type LiveRoomUserInfo = {
    user: {
        nickname: string;
        uniqueId: string;
        roomId: string;
        signature: string;
        avatarLarger: string;
        avatarMedium: string;
        avatarThumb: string;
    };
    liveRoom: {
        title: string;
        status: number;
        startTime: number;
        streamId: string;
    };
};

export type Profile = {
    nickname: string;
    uniqueId: string;
    signature: string;
    avatar: string;
    videos: Array<{
        id: string;
        desc: string;
        cover: string;
        playAddr: string;
        authorUniqueId: string;
        createTime: number;
    }>;
};
