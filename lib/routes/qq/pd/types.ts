// Description: Types for QQ PD API.

export type Feed = {
    id: string;
    feed_type: number; // 1-post, 2-article
    patternInfo: string; // JSON string
    channelInfo: ChannelInfo;
    title: {
        contents: FeedContent[];
    };
    contents: {
        contents: FeedContent[];
    };
    images: FeedImage[];
    poster: {
        id: string;
        nick: string;
    };
    createTime: string;
};

export type ChannelInfo = {
    name: string;
    guild_number: string;
    guild_name: string;
    sign: {
        guild_id: string;
        channel_id: string;
    };
};

export type FeedContent = {
    type: number;
    pattern_id: string;
    text_content?: {
        text: string;
    };
    emoji_content?: {
        id: string;
        type: string;
    };
    url_content?: {
        url: string;
        displayText: string;
        type: number;
    };
};

export type FeedImage = {
    picId: string;
    picUrl: string;
    width: number;
    height: number;
    pattern_id?: string;
};

export type FeedPattern = {
    id: string;
    props?: {
        textAlignment: number; //  0-left, 1-center, 2-right
    };
    data: FeedPatternData[];
};

export type FeedPatternData = {
    type: number; // 1-text, 2-emoji, 5-link, 6-image, 9-newline
    text?: string;
    props?: FeedFontProps;
    fileId?: string;
    taskId?: string;
    url?: string;
    width?: number;
    height?: number;
    desc?: string;
    href?: string;
};

export type FeedFontProps = {
    fontWeight: number; // 400-normal, 700-bold
    italic: boolean;
    underline: boolean;
};
