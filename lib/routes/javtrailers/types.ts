export interface Video {
    _id: string;
    categories: Category[];
    casts: Cast[];
    director: string;
    gallery: string[];
    title: string;
    javLink: JavLink;
    contentId: string;
    dvdId: string;
    studio: Studio;
    releaseDate: string;
    duration: number;
    image: string;
    jpDirector: string;
    jpTitle: string;
    /**
     * HLS stream URL
     */
    trailer: string;
    zhTitle: string;
    __v: number;
}

interface Category {
    _id: string;
    slug: string;
    name: string;
    jpName: string;
    zhName: string;
}

interface Cast {
    _id: string;
    slug: string;
    ruby: string;
    link: string;
    name: string;
    jpName: string;
    avatar: string;
    __v: number;
}

interface JavLink {
    _id: string;
    link: string;
    processed: boolean;
    isProfessional: boolean;
    upcoming: boolean;
    __v: number;
}

interface Studio {
    _id: string;
    slug: string;
    name: string;
    link: string;
    jpName: string;
}
