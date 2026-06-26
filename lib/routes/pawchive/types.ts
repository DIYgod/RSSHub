export interface PawchivePost {
    id: string;
    user: string;
    service: string;
    title: string;
    content: string;
    shared_file: boolean;
    added: string;
    published: string;
    edited: string;
    file: PawchiveFile | Record<string, never>;
    attachments: PawchiveFile[];
}

export interface PawchiveFile {
    name: string;
    path: string;
}
