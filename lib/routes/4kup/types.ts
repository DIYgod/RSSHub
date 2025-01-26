interface WPPost {
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
    date: string;
    link: string;
}

export type { WPPost };
