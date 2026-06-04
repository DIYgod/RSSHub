export type TimeStamp = `${number}`;

export type DateFormat = `${number}-${number}-${number}`;

export type DateTimeFormat = `${number}-${number}-${number} ${number}:${number}:${number}`;

export type BaseResponse<T = any> = {
    code: number;
    data: T;
    msg: string;
};

export interface Resently {
    detail: string;
    event_type: string;
    event_type_id: string;
    log_time: DateTimeFormat;
    part_date: DateFormat;
}

export interface UserInfo {
    avatar: string;
    character_name: string;
    group_name: string;
}

export interface UserPost {
    created_at: DateTimeFormat;
    posts_id: string;
    part_name: string;
    title: string;
    character_name: string;
    group_name: string;
    area_name: string;
}

export interface PostDetail {
    contentInfo: {
        content: string;
        created_at: DateTimeFormat;
        id: string;
        posts_id: string;
    };
    created_at: DateTimeFormat;
    updated_at: DateTimeFormat;
}

export interface TeamPosition {
    D1: string;
    D2: string;
    D3: string;
    D4: string;
    H1: string;
    H2: string;
    MT: string;
    ST: string;
}
