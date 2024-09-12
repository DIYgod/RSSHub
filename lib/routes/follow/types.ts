export interface FollowResponse<T> {
    code: number;
    data: T;
}

export interface Subscription {
    category: string;
    feedId: string;
    feeds: {
        checkAt: string;
        description: string;
        errorAt: unknown;
        errorMessage: unknown;
        etagHeader: string;
        id: string;
        image: unknown;
        lastModifiedHeader: string;
        ownerUserId: string | null;
        siteUrl: string;
        title: string;
        ttl: number;
        url: string;
    };
    isPrivate: boolean;
    title: string | null;
    userId: string;
    view: number;
}

export interface Profile {
    id: string;
    name: string;
    email: string;
    emailVerified: unknown;
    image: string;
    handle: unknown;
    createdAt: string;
}
