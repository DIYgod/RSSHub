// interfaces/api.ts
export interface ApiResponse {
    data: {
        list: ListItem[];
    };
}

export interface ListItem {
    title: string;
    description?: string;
    id: string;
    time_scheduled: number;
    channel: Channel;
    poster_url: string;
    image_auto_url?: string;
    video_url: string;
    text?: string;
    media: Media[];
    watch_count?: number;
}
export interface Channel {
    icon: string;
    id: string;
    name: string;
}

export interface Media {
    type: string;
    id: string;
    url: string;
    width: number;
    height: number;
    ratio: number;
}
