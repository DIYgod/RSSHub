export interface MetadataResponse {
    description: string;
}

export interface RepositoriesResponse {
    results: RepositoryResult[];
}

export interface RepositoryResult {
    description: string;
    last_updated: string;
    name: string;
    pull_count: number;
    star_count: number;
    status_description: string;
}

export interface TagsResponse {
    results: TagResponse[];
}

export interface TagResponse {
    digest: string;
    images: ImageResult[];
    last_updated: string;
    name: string;
}

export interface ImageResult {
    architecture: string;
    digest: string;
    last_pulled: string;
    last_pushed: string;
    os: string;
    size: number;
    variant: string | null;
}
