export interface PodcastInfo {
    id: string;
    title: string;
    channels: string[];
    feedUrl: string;
    explicit: boolean;
    description: string;
    itunesCategories: string[];
    cover: string;
    complete: boolean;
    blocked: boolean;
    lastIndexedAt: string;
    publishDate: string;
    copyright: string;
    url: string;
    tsv: string;
    ownerEmail: string;
    ownerName: string;
    artistName: string;
    language: string;
    subtitle: string;
    enableProductPage: boolean;
    itunesType: string;
    contentEncoded: string;
    createdAt: string;
    updatedAt: string;
    donationUrl: string;
    weight: number;
    activated: boolean;
    guid: string;
    soundonId: string;
}

export interface Podcast {
    id: string;
    updatedAt: string;
    createdAt: string;
    data: PodcastData;
}

interface PodcastData {
    id: string;
    guid: string;
    hash: string;
    title: string;
    audioUrl: string;
    explicit: boolean;
    description: string;
    complete: boolean;
    publishDate: string;
    itunesKeywords: string[];
    audioType: string;
    duration: number;
    artistName: string;
    url: string;
    cover: string;
    contentEncoded: string;
    podcastId: string;
    summary: string;
    episodeType: string;
    exclusiveType: string;
    createdAt: string;
    updatedAt: string;
    weight: number;
    keywords: string[];
    activated: boolean;
}
