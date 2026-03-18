export type WPTerm = {
    id: number;
    name: string;
    slug: string;
    taxonomy: 'category' | 'post_tag' | string;
};

export type WPPost = {
    link: string;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
    date?: string;
    date_gmt?: string;
    _embedded?: {
        'wp:term'?: WPTerm[][];
    };
};
