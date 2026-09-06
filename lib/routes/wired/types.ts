interface ImageSource {
    aspectRatio: string;
    width: number;
    url: string;
    srcset: string;
}

interface Image {
    contentType: string;
    id: string;
    altText: string;
    credit: string;
    caption: string;
    metaData: string;
    modelName: string;
    sources: {
        sm: ImageSource;
        md: ImageSource;
        lg: ImageSource;
        xl: ImageSource;
        xxl: ImageSource;
    };
    segmentedSources: {
        sm: ImageSource[];
        lg: ImageSource[];
    };
    showImageWithoutLink: boolean;
    isLazy: boolean;
    brandDetail: {
        brandIcon: string;
        brandName: string;
    };
}

interface Contributor {
    author: {
        items: Array<{ name: string }>;
    };
    photographer: {
        items: any[];
    };
}

interface Rubric {
    name: string;
    url: string;
}

interface RecircMostPopular {
    contentType: string;
    dangerousHed: string;
    dangerousDek: string;
    url: string;
    rubric: { name: string };
    tout: Image;
    image: Image;
    contributors: {
        author: {
            brandName: string;
            brandSlug: string;
            preamble: string;
            items: Array<{ name: string }>;
        };
    };
}

export interface Item {
    contributors: Contributor;
    contentType: string;
    date: string;
    dangerousDek: string;
    dangerousHed: string;
    id: string;
    image: Image;
    imageLabels: any[];
    hasNoFollowOnSyndicated: boolean;
    rating: string;
    rubric: Rubric;
    url: string;
    recircMostPopular: RecircMostPopular[];
}
