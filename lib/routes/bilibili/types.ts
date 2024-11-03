export interface ResultResponse<Result> {
    result: Result;
}

/**
 * 番剧信息
 *
 * @interface MediaResult
 *
 * @property {string} cover - 封面。
 * @property {string} evaluate - 摘要。
 * @property {number} media_id - 媒体 ID。
 * @property {number} season_id - 季度 ID。
 * @property {string} share_url - 分享 URL。此属性是注入的。
 * @property {string} title - 标题。
 */
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

/**
 * 番剧剧集信息
 *
 * @interface EpisodeResult
 *
 * @property {string} cover - 封面。
 * @property {number} id - 剧集 ID。
 * @property {string} long_title - 完整标题。
 * @property {string} share_url - 分享 URL。
 * @property {string} title - 短标题。
 */
export interface EpisodeResult {
    cover: string;
    id: number;
    long_title: string;
    share_url: string;
    title: string;
}
