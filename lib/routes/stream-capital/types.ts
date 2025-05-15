export interface EncryptedResponse {
    code: number;
    data: string;
    msg: string;
}

interface Tag {
    blogId: number;
    tagId: number;
    length: number;
    tagName: string;
    beginIndex: number;
}

interface DetailInfo {
    articleContent: string;
    blogId: number;
    videoCoverPicUrl: string;
    excerpt: string;
    id: number;
    videoUrl: string;
}

export interface WebBlog {
    title: string;
    type: number;
    intro: null;
    avatarUrl: null;
    userName: string;
    ctime: string;
    isPublish: number;
    id: number;
    themeTitle: string;
    themeId: number;
    viewCount: number;
    coverUrl: string;
    videoDuration: number;
    originUrl: string;
    userId: number;
    content: string;
    tags: Tag[];
    isCollect: number;
    detailInfo: DetailInfo;
}
