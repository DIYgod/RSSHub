interface Image {
    alt: null;
    height: number;
    width: number;
    url: string;
    blurhash: string;
}

interface Badge {
    name: string;
    iconUrl: string;
}

interface Author {
    _id: string;
    username: string;
    avatarUrl: string | null;
    avatarImage: Image | null;
    badges: Badge[];
    blockStatus: null;
    roles: never[];
}

interface Founder extends Author {
    bio: string;
}

type Manager = Author;

interface Community {
    _id: string;
    name: string;
    slug: string;
    description: string;
    iconUrl: string;
    guidelinesPM: null;
    descriptionPM: null;
    iconImage: null;
    bannerUrl: string;
    bannerDesktopImage: null;
    bannerMobileImage: null;
    founder: Founder;
    manager: Manager;
    memberCount: number;
    postCount: number;
    isJoinedByAccount: boolean;
    isPinnedByAccount: boolean;
    isJoinedByDefault: boolean;
    createdDate: string;
    editedDate: string;
    deletedDate: null;
}

interface Attachment {
    __typename: string;
    alt: null;
    height: number;
    width: number;
    url: string;
    blurhash: string;
}

interface LinkMark {
    type: string;
    attrs: {
        href: string;
        target: string;
        rel: string;
        class: null;
    };
}

interface TextContent {
    type: string;
    marks?: LinkMark[];
    text?: string;
    content?: TextContent[];
}

interface PMImage {
    id: string;
    url: string;
    width: number;
    height: number;
    fileSize: number;
    blurhash: string;
    mimeType?: string;
    alt?: string;
}

interface PMBlockAttrs {
    empty: boolean;
    id?: string | null;
    images?: PMImage[];
}

interface PMBlock {
    type: string;
    attrs?: PMBlockAttrs;
    content?: TextContent[];
}

interface PMMetadata {
    linkBlockCount: number;
    imageBlockCount: number;
    imageCount: number;
    mentionCount: number;
    communityMentionCount: number;
    nsfw: boolean;
}

interface PM {
    type: string;
    attrs: {
        nsfw: boolean;
    };
    content: PMBlock[];
    metadata: PMMetadata;
}

interface ContextCards {
    tldr: null;
}

export interface PostNode {
    _id: string;
    title: string;
    isSavedByAccount: boolean;
    moderationStatus: string;
    isDuggByAccount: boolean;
    voteDirectionByAccount: null;
    upvoteCount: number;
    downvoteCount: number;
    score: number;
    reportByAccount: null;
    slug: string;
    type: string;
    externalContent: null;
    commentCount: number;
    shareCount: number;
    textPreview: string;
    contextCards: ContextCards;
    community: Community;
    attachments: Attachment[];
    author: Author;
    createdDate: string;
    editedDate: string;
    deletedDate: null;
    nsfw: boolean;
    text: string;
    pm: PM;
    moderatedDate: null;
    moderationReason: null;
}
