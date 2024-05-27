export interface Dependencies {
    version_id: string;
    project_id: string;
    file_name: string;
    dependency_type: string;
}
export interface Hashes {
    sha512: string;
    sha1: string;
}
export interface File {
    hashes: Hashes;
    url: string;
    filename: string;
    primary: boolean;
    size: number;
    file_type: string;
}
export interface Version {
    name: string;
    version_number: string;
    changelog: string;
    dependencies: Dependencies[];
    game_versions: string[];
    version_type: string;
    loaders: string[];
    featured: boolean;
    status: string;
    requested_status: string;
    id: string;
    project_id: string;
    author_id: string;
    date_published: string;
    downloads: number;
    files: File[];
}

export interface Author {
    id: string;
    username: string;
    name: string;
    avatar_url: string;
    bio: string;
    created: string;
    role: string;
    badges: number;
}

export interface Project {
    slug: string;
    title: string;
    description: string;
    categories: string[];
    client_side: string;
    server_side: string;
    body: string;
    status: string;
    requested_status: string;
    additional_categories: string[];
    issues_url: string;
    source_url: string;
    wiki_url: string;
    discord_url: string;
    donation_urls: DonationUrl[];
    project_type: string;
    downloads: number;
    icon_url: string;
    color: number;
    thread_id: string;
    monetization_status: string;
    id: string;
    team: string;
    published: string;
    updated: string;
    approved: string;
    queued: string;
    followers: number;
    license: License;
    versions: string[];
    game_versions: string[];
    loaders: string[];
    gallery: Gallery[];
}
export interface DonationUrl {
    id: string;
    platform: string;
    url: string;
}
export interface License {
    id: string;
    name: string;
    url: string;
}
export interface Gallery {
    url: string;
    featured: boolean;
    title: string;
    description: string;
    created: string;
    ordering: number;
}
