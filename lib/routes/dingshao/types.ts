export interface Value {
    value: {
        channel: string;
        recentMessages: string[];
        bundle: Bundle;
    };
}

interface Bundle {
    channels: Channel[];
    users: User[];
    channelMessages: ChannelMessage[];
    channelMessageInteractions: any[];
}

interface Channel {
    id: string;
    owner: string;
    profile: Profile;
    tags: string[];
    script: Script;
    private: boolean;
    stats: Stats;
    sharable: boolean;
    lastPublishedAt: string;
}

interface Profile {
    name: string;
    description: string;
    image: string;
}

interface Script {
    homepage: string;
}

interface Stats {
    subscribers: number;
}

interface User {
    id: string;
    profile: UserProfile;
}

interface UserProfile {
    name: string;
    image: string;
}

interface ChannelMessage {
    id: string;
    channel: string;
    author: string;
    tags: string[];
    excerpt: string;
    content: string;
    likes: number;
    private: boolean;
    sharable: boolean;
    script: boolean;
    publishedAt: string;
}
