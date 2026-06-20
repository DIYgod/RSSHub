export interface BasicResponse<T> {
    succeeded: boolean;
    resp_data: T;
    code?: number;
    info?: string;
    error?: string;
}

interface BasicTopic {
    comments_count: number;
    create_time: string;
    digested: boolean;
    group: {
        group_id: number;
        name: string;
        type: string;
        background_url: string;
    };
    latest_likes: Array<{
        create_time: string;
        owner: {
            avatar_url: string;
            name: string;
            number: number;
            user_id: number;
        };
    }>;
    likes_count: number;
    readers_count: number;
    reading_count: number;
    rewards_count: number;
    topic_id: number;
    type: string;
    user_specific: {
        liked: false;
        subscribed: false;
    };
    title?: string;
}

interface TalkTopic extends BasicTopic {
    type: 'talk';
    talk: {
        text?: string;
        images?: TopicImage[];
    };
}

export interface QATopic extends BasicTopic {
    type: 'q&a';
    answer?: {
        owner: {
            avatar_url: string;
            description: string;
            location: string;
            name: string;
            user_id: number;
        };
        text?: string;
        images?: TopicImage[];
    };
    answered: boolean;
    question: {
        images?: TopicImage[];
        text?: string;
        owner?: {
            avatar_url: string;
            description: string;
            location: string;
            name: string;
            user_id: number;
        };
    };
}

interface TaskTopic extends BasicTopic {
    type: 'task';
    task: {
        images?: TopicImage[];
        text?: string;
    };
}

interface SolutionTopic extends BasicTopic {
    type: 'solution';
    solution: {
        task_id: number;
        text?: string;
        images?: TopicImage[];
    };
}

interface UserInfo {
    chat: {
        identifier: string;
    };
    user: {
        avatar_url: string;
        introduction: string;
        location: string;
        name: string;
        unique_id: string;
        user_id: number;
    };
    user_specific: {
        followed: boolean;
    };
}

interface GroupInfo {
    group: {
        admin_ids: number[];
        alive_time: string;
        background_url: string;
        category: {
            category_id: number;
            title: string;
        };
        create_time: string;
        description: string;
        group_id: number;
        guest_ids: number[];
        name: string;
    };
}

export interface TopicImage {
    image_id: number;
    large: {
        height: number;
        width: number;
        url: string;
    };
    original: {
        height: number;
        width: number;
        url: string;
        size: number;
    };
    thumbnail: {
        height: number;
        width: number;
        url: string;
    };
    type: string;
}

export type Topic = TalkTopic | QATopic | TaskTopic | SolutionTopic;

export type ResponseData = UserInfo | GroupInfo | Topic[];

export type UserInfoResponse = BasicResponse<UserInfo>;

export type GroupInfoResponse = BasicResponse<GroupInfo>;

export type TopicsResponse = BasicResponse<{
    topics: Topic[];
}>;
