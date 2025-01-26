interface WPPost {
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
    date_gmt: string;
    link: string;
}

export type { WPPost };
