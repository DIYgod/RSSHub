export interface Post {
    title: string;
    post_name: string;
    author_name: string;
    created_at?: number;
    updated_at?: number;
}

export interface PostDetail extends Post {
    content: string;
}
