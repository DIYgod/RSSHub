// Hupu API response types

/**
 * Badge metadata
 */
interface Badge {
    name: string;
    color: string;
    v2DayColor: string;
    v2NightColor: string;
    relationUrl: string | null;
    colorBg: string;
    v2DayColorBg: string;
    v2NightColorBg: string;
    iconDay: string;
    iconNight: string;
}

/**
 * Home page post (an entry in the res array)
 */
interface HomePostItem {
    tid: string;
    title: string;
    url: string;
    label: string;
    lights: string;
    replies: string;
    type: string; // e.g., "3_pic", "1_pic", "video"
    source: string[];
    isNews: boolean;
    badge: Badge[];
}

/**
 * News or category entry in the newsData array
 */
interface NewsDataItem {
    nid: string;
    title: string;
    img: string;
    link: string;
    badge: Badge[];
    type: string; // e.g., "LINK", "IMG_TEXT"
    lights: number;
    replies: number;
    publishTime: string;
    tid: string;
}

/**
 * Recommended match toast metadata
 */
interface RecommendMatchToast {
    date: string;
    matchCount: number;
    title: string;
    toastTitle: string | null;
    foldTitle: string;
    matchListLink: string | null;
    matchCountText: string;
}

/**
 * Recommended match metadata
 */
interface RecommendMatch {
    projectId: string | null;
    version: string | null;
    traceId: string | null;
    matchList: any[];
    events: any[];
    toast: RecommendMatchToast;
    success: boolean;
    is_login: number;
    is_jrs: boolean;
    night: number;
    client: string | null;
}

/**
 * Home page properties
 */
interface HomePageProps {
    res: HomePostItem[];
    totalNum: number;
    supportHydrate: boolean;
}

/**
 * Basketball category properties (NBA/CBA)
 */
interface BasketballPageProps {
    leagueType: string;
    newsData: NewsDataItem[];
    recommendMatch: RecommendMatch;
    supportHydrate: boolean;
}

/**
 * Soccer category properties
 */
interface SoccerPageProps {
    schedules: any[];
    news: NewsDataItem[];
    supportHydrate: boolean;
}

/**
 * Union of category page properties
 */
type CategoryPageProps = BasketballPageProps | SoccerPageProps;

/**
 * API response props
 */
interface ApiResponseProps {
    pageProps: HomePageProps | CategoryPageProps;
    __N_SSP: boolean;
}

/**
 * Complete API response
 */
export interface HupuApiResponse {
    props: ApiResponseProps;
    page: string;
    query: Record<string, string | string[]>;
    buildId: string;
    assetPrefix: string;
    isFallback: boolean;
    gssp: boolean;
    scriptLoader: any[];
}

/**
 * Type guards for page variants
 */
export function isHomePageProps(pageProps: HomePageProps | CategoryPageProps): pageProps is HomePageProps {
    return 'res' in pageProps;
}

export function isBasketballPageProps(pageProps: CategoryPageProps): pageProps is BasketballPageProps {
    return 'newsData' in pageProps && 'leagueType' in pageProps;
}

export function isSoccerPageProps(pageProps: CategoryPageProps): pageProps is SoccerPageProps {
    return 'news' in pageProps && 'schedules' in pageProps;
}

/**
 * Type guards for item variants
 */
export function isHomePostItem(item: HomePostItem | NewsDataItem): item is HomePostItem {
    return 'url' in item && 'isNews' in item;
}

export function isNewsDataItem(item: HomePostItem | NewsDataItem): item is NewsDataItem {
    return 'nid' in item && 'link' in item && 'publishTime' in item;
}

// Export concrete types for other modules
export type { ApiResponseProps, Badge, BasketballPageProps, CategoryPageProps, HomePageProps, HomePostItem, NewsDataItem, RecommendMatch, SoccerPageProps };
