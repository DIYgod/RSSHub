interface BoardPerm {
    errCode: number;
}
interface PostPerm {
    errCode: number;
}

export interface BoardInfo {
    id: number;
    boardId: number;
    title: string;
    shortTitle: string;
    postCount: number;
    followCount: number;
    boardAvatar: string;
    boardPerm: BoardPerm;
    followStatus: boolean;
}

interface PostUser {
    userId: number;
    avatar: string;
    username: string;
    nickname: string;
    bbsStatus: number;
    userTitle: UserTitle;
}

interface PostDetail {
    postId: number;
    boardId: number;
    reads: number;
    pv: number;
    subject: string;
    postUser: PostUser;
    screenUrlList: string[];
    videoScreen: boolean;
    isEditorRecommend: boolean;
}

export interface PostListData {
    pageNum: number;
    pageSize: number;
    total: number;
    result: PostDetail[];
    empty: boolean;
}

interface UserTitle {
    type: number;
    titles: string[];
}

interface TagInfo {
    tagName: string;
}

interface PostSpecial {
    specialId: number;
    specialName: string;
    followCount: number;
    postCount: number;
    followStatus: boolean;
    personalSpecial: boolean;
    avatar: string;
    customAvatar: string;
    backgroundColor: string;
    type: number;
}

interface Video {
    videoId: number;
    videoUrl: string;
    cover: string;
    size: number;
    duration: number;
    auditState: number;
    userVideoState: number;
}

interface Post {
    id: number;
    rootId: number;
    createTime: number;
    simpleBody: string;
    subject: string;
    body: string;
    coverPic: string;
    isVideoCover: boolean;
    isVideoCoverPic: boolean;
    postTime: number;
    reads: number;
    pv: number;
    replies: number;
    qualityPost: boolean;
    contentType: number;
    postStatus: number;
    signatured: number;
    userVote: boolean;
    postSpecial: PostSpecial;
    isEditorRecommend: boolean;
    isTop: boolean;
    ipLocation: string;
    isCurrentUser: boolean;
    anonymous: boolean;
    boardInfo: BoardInfo;
    votes: number;
    archived: boolean;
    approved: boolean;
    video?: Video;
    postPerm: PostPerm;
    showStatus: boolean;
    postUser: PostUser;
    hintInfos: Array<false>;
    isDisableRepost: boolean;
    tagInfos: TagInfo[];
    isVoteActivityPost: boolean;
    isShowCaseTag: boolean;
    isPaidContent: boolean;
    isNeedPay: boolean;
}

export interface PostData {
    code: string;
    message: string;
    data: Post;
}

interface SpecialAdmin {
    userId: number;
    username: string;
    nickname: string;
    avatar: string;
    followers: number;
    bbsVotes: number;
    level: number;
    talentStatus: number;
    levelStatus: number;
    professional: boolean;
    enterpriseStatus: boolean;
    identificationTitle: string;
    blueVip: boolean;
    talentBoard: Array<false>;
    userTitle: UserTitle;
    enterpriseName: string;
}

export interface SpecialBoardDetail {
    id: number;
    name: string;
    content: string;
    categoryId: number;
    type: number;
    submitted: number;
    status: number;
    rangeed: number;
    userId: number;
    followCount: number;
    postCount: number;
    backgroundColor: string;
    pushMessage: number;
    bestTime: number;
    updateTime: number;
    createTime: number;
    modifyTime: number;
    followStatus: boolean;
    tabOption: number;
    specialAvatar: string;
    pushStatus: boolean;
    specialAdmins: SpecialAdmin[];
    isContribute: boolean;
    post: Array<false>;
    isOpenPostEntrance: boolean;
}

interface RecommendPost {
    entityId: number;
    entityType: number;
    dataTime: number;
    sortValue: number;
    recommendReason: string;
    postInfo: Post;
    feedType: number;
    source: string;
    pointMap: Record<string, unknown>;
    globalId: string;
}

export interface RecommendListData {
    pageNum: number;
    pageSize: number;
    total: number;
    result: RecommendPost[];
    empty: boolean;
}
