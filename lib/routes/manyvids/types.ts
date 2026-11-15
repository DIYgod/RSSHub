interface Avatar {
    url: string;
}

interface Creator {
    id: string;
    slug: string;
    stageName: string;
    avatar: Avatar;
}

interface Thumbnail {
    url: string;
}

interface Preview {
    url: string;
}

interface Price {
    free: boolean;
    onSale: boolean;
    regular: string;
}

interface Video {
    id: string;
    title: string;
    slug: string;
    duration: string;
    creator: Creator;
    thumbnail: Thumbnail;
    preview: Preview;
    price: Price;
    likes: number;
    views: number;
    type: string;
}

interface Pagination {
    total: number;
    totalWithoutFilters: number;
    currentPage: number;
    totalPages: number;
    nextPage: number;
}

export interface Videos {
    statusCode: number;
    statusMessage: string;
    data: Video[];
    pagination: Pagination;
}
