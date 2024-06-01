export interface LinkData {
    '@context': string;
    '@graph': {
        '@type': string;
        headline: string;
        name: string;
        about: string;
        description: string;
        image: {
            '@type': string;
            representativeOfPage: string;
            url: string;
        };
        datePublished: string;
        dateModified: string;
        author: {
            '@type': string;
            name: string;
            url: string;
        };
    }[];
}

export interface VideoSetup {
    techOrder: string[];
    sources: {
        type: string;
        src: string;
    }[];
}
