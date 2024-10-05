export interface FollowResponse<T> {
    code: number;
    data: T;
}

export type Subscription = FeedSubscription | ListSubscription;

export interface Profile {
    id: string;
    name: string;
    email: string;
    emailVerified: unknown;
    image: string;
    handle: unknown;
    createdAt: string;
}

export interface BaseSubscription {
    feedId: string;
    isPrivate: boolean;
    title: string | null;
    userId: string;
    view: number;
}

export interface FeedSubscription extends BaseSubscription {
    category: string | null;
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
        type: 'feed';
        url: string;
    };
}

export interface ListSubscription extends BaseSubscription {
    lastViewedAt: string;
    listId: string;
    lists: {
        description: string;
        fee: number;
        feedIds: string[];
        id: string;
        image: string;
        owner: {
            createdAt: string;
            emailVerified: unknown;
            handle: string | null;
            id: string;
            image: string;
            name: string;
        };
        ownerUserId: string;
        timelineUpdatedAt: string;
        title: string;
        type: 'list';
        view: number;
    };
}
