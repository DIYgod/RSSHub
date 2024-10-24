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

interface Post {
    id: number;
    createTime: number;
    subject: string;
    body: string;
    reads: number;
    pv: number;
    ipLocation: string;
    isCurrentUser: boolean;
    anonymous: boolean;
    boardInfo: BoardInfo;
    postPerm: PostPerm;
    showStatus: boolean;
    postUser: PostUser;
    hintInfos: false[];
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
