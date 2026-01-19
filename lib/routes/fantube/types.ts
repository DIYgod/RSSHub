interface PlanPost {
    id: string;
    thumbnailUrl: string;
    title: string;
}

interface Plan {
    id: string;
    title: string;
    price: number;
    description: string;
    isArchive: boolean;
    isRecommended: boolean;
    deleteRequestAt: null;
    subscriptionCloseAt: null;
    capacity: null;
    isSubscribing: boolean;
    subscribersCount: number;
    planPosts: {
        totalCount: number;
        nodes: Array<{
            post: PlanPost;
        }>;
    };
}

interface Followers {
    totalCount: number;
}

interface CreatorUnitPurchaseTotalCount {
    totalCount: number;
}

interface CreatorPostsTotalCount {
    totalCount: number;
}

interface AllPosts {
    totalCount: number;
}

export interface CreatorFragment {
    displayName: string;
    id: string;
    messageReceive: boolean;
    coverImageUrl: string;
    avatarImageUrl: string;
    identifier: string;
    description: string;
    snsLinks: string[];
    isSelf: boolean;
    following: boolean;
    followers: Followers;
    creatorUnitPurchaseTotalCount: CreatorUnitPurchaseTotalCount;
    creatorPostsTotalCount: CreatorPostsTotalCount;
    allPosts: AllPosts;
    plans: {
        totalCount: number;
        nodes: Plan[];
    };
}

interface Comments {
    totalCount: number;
}

export interface PostReelNode {
    id: string;
    title: string;
    type: 'VIDEO' | 'IMAGE';
    price: number;
    sampleVideoId: string | null;
    thumbnailUrl: string;
    description: string;
    publishStartAt: string;
    pinnedAt: string | null;
    isBuyEnabled: boolean;
    isFavorite: boolean;
    isMine: boolean;
    canComment: boolean;
    creator: CreatorFragment;
    comments: Comments;
    planPosts: {
        nodes: Array<{
            plan: Plan;
        }>;
    };
    favoritesCount: number;
    contentData: {
        __typename: 'PostVideoType' | 'PostImageType';
        videoUrl: string;
        isSample: boolean;
        noSample: boolean;
        durationSeconds: number;
        encrypted: boolean;
        imageUrls: string[];
        count: number;
    };
}
