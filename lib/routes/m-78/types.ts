export interface Post {
    id: number;
    content: {
        rendered: string;
    };
    date_gmt: string;
    modified_gmt: string;
    link: string;
    categories: number[];
    title: {
        rendered: string;
    };
}
