export interface UserInfoResponse {
    body: {
        user: {
            userId: string;
            name: string;
            iconUrl: string;
        };
        creatorId: string;
        description: string;
        hasAdultContent: boolean;
        coverImageUrl: string;
        profileLinks: string[];
        profileItems: {
            id: string;
            type: string;
            serviceProvider: string;
            videoId: string;
        }[];
        isFollowed: boolean;
        isSupported: boolean;
        isStopped: boolean;
        isAcceptingRequest: boolean;
        hasBoothShop: boolean;
    };
}

export interface PostListResponse {
    body: {
        items: PostItem[];
        nextUrl: string | null;
    };
}

export interface PostDetailResponse {
    body: PostDetail;
}

export interface PostItem {
    commentCount: number;
    cover: {
        type: string;
        url: string;
    };
    creatorId: string;
    excerpt: string;
    feeRequired: number;
    hasAdultContent: boolean;
    id: string;
    isLiked: boolean;
    isRestricted: boolean;
    likeCount: number;
    publishedDatetime: string;
    tags: string[];
    title: string;
    updatedDatetime: string;
    user: {
        iconUrl: string;
        name: string;
        userId: string;
    };
}

interface BasicPost {
    commentCount: number;
    commentList: {
        items: {
            body: string;
            createdDatetime: string;
            id: string;
            isLiked: boolean;
            isOwn: boolean;
            likeCount: number;
            parentCommentId: string;
            replies: {
                body: string;
                createdDatetime: string;
                id: string;
                isLiked: boolean;
                isOwn: boolean;
                likeCount: number;
                parentCommentId: string;
                rootCommentId: string;
            }[];
            rootCommentId: string;
            user: {
                iconUrl: string;
                name: string;
                userId: string;
            };
        }[];
        nextUrl: string | null;
    };
    coverImageUrl: string | null;
    creatorId: string;
    excerpt: string;
    feeRequired: number;
    hasAdultContent: boolean;
    id: string;
    imageForShare: string;
    isLiked: boolean;
    isRestricted: boolean;
    likeCount: number;
    nextPost: {
        id: string;
        title: string;
        publishedDatetime: string;
    };
    publishedDatetime: string;
    tags: string[];
    title: string;
    updatedDatetime: string;
}

export interface ArticlePost extends BasicPost {
    type: 'article';
    body: {
        blocks: Block[];
        embedMap: {
            [key: string]: unknown;
        };
        fileMap: {
            [key: string]: {
                id: string;
                extension: string;
                name: string;
                size: number;
                url: string;
            };
        };
        imageMap: {
            [key: string]: {
                id: string;
                originalUrl: string;
                thumbnailUrl: string;
                width: number;
                height: number;
                extension: string;
            };
        };
        urlEmbedMap: {
            [key: string]:
                | {
                      type: 'html';
                      html: string;
                      id: string;
                  }
                | {
                      type: 'fanbox.post';
                      id: string;
                      postInfo: PostItem;
                  };
        };
    };
}

export interface FilePost extends BasicPost {
    type: 'file';
    body: {
        files: {
            extension: string;
            id: string;
            name: string;
            size: number;
            url: string;
        }[];
        text: string;
    };
}

export interface VideoPost extends BasicPost {
    type: 'video';
    body: {
        text: string;
        video: {
            serviceProvider: 'youtube' | 'vimeo' | 'soundcloud';
            videoId: 'string';
        };
    };
}

export interface ImagePost extends BasicPost {
    type: 'image';
    body: {
        images: {
            id: string;
            originalUrl: string;
            thumbnailUrl: string;
            width: number;
            height: number;
            extension: string;
        }[];
        text: string;
    };
}

export interface TextPost extends BasicPost {
    type: 'text';
    body: {
        text: string;
    };
}

export interface PostDetailResponse {
    body: PostDetail;
}

interface TextBlock {
    type: 'p';
    text: string;
    styles?: {
        length: number;
        offset: number;
        type: 'bold';
    }[];
}

interface HeaderBlock {
    type: 'header';
    text: string;
}

interface ImageBlock {
    type: 'image';
    imageId: string;
}

interface FileBlock {
    type: 'file';
    fileId: string;
}

interface EmbedBlock {
    type: 'url_embed';
    urlEmbedId: string;
}

type PostDetail = ArticlePost | FilePost | ImagePost | VideoPost | TextPost;

type Block = TextBlock | HeaderBlock | ImageBlock | FileBlock | EmbedBlock;
