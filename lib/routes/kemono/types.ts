interface KemonoPost {
    id: string;
    title: string;
    content: string;
    published: string;
    service: string;
    user: string;
    file?: any;
    attachments?: any[];
}

interface KemonoFile {
    name: string;
    path: string;
    extension: string;
}

interface DiscordMessage {
    id: string;
    content: string;
    published: string;
    author: {
        username: string;
        discriminator: string;
    };
    server: string;
    channel: string;
    attachments?: any[];
}

export type { KemonoPost, KemonoFile, DiscordMessage };
