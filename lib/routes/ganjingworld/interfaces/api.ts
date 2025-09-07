// interfaces/api.ts
export interface Channel {
    icon: string;
    id: string;
    name: string;
}

export interface ListItem {
    title: string;
    description: string;
    id: string;
    time_scheduled: number;
    channel: Channel;
    poster_url: string;
    text: string;
}

export interface ApiResponse {
    data: {
        list: ListItem[];
    };
}
