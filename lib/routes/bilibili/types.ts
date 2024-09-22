export interface ResultResponse<Result> {
    result: Result;
}

export interface MediaResult {
    cover: string;
    evaluate: string;
    media_id: number;
    season_id: number;
    share_url: string; // injected
    title: string;
}

export interface SeasonResult {
    main_section: SectionResult;
    section: SectionResult[];
}

export interface SectionResult {
    episodes: EpisodeResult[];
}

export interface EpisodeResult {
    cover: string;
    id: number;
    long_title: string;
    share_url: string;
    title: string;
}
