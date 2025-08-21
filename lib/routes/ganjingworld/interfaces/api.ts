// interfaces/api.ts
export interface Channel {
    name: string;
}

export interface VideoItem {
    title: string;
    description: string;
    id: string;
    time_scheduled: number;
    channel: Channel;
}

export interface ApiResponse {
    data: {
        list: VideoItem[];
    };
}
