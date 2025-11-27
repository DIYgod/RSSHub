// 虎扑 API 响应数据类型定义

/**
 * 徽章信息
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
 * 首页帖子数据项（res 数组中的项）
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
 * 新闻/分类页面数据项（newsData 数组中的项）
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
 * 推荐比赛 Toast 信息
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
 * 推荐比赛信息
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
 * 首页页面属性
 */
interface HomePageProps {
    res: HomePostItem[];
    totalNum: number;
    supportHydrate: boolean;
}

/**
 * 篮球分类页面属性 (NBA/CBA)
 */
interface BasketballPageProps {
    leagueType: string;
    newsData: NewsDataItem[];
    recommendMatch: RecommendMatch;
    supportHydrate: boolean;
}

/**
 * 足球分类页面属性
 */
interface SoccerPageProps {
    schedules: any[];
    news: NewsDataItem[];
    supportHydrate: boolean;
}

/**
 * 所有分类页面属性的联合类型
 */
type CategoryPageProps = BasketballPageProps | SoccerPageProps;

/**
 * API 响应的 props 结构
 */
interface ApiResponseProps {
    pageProps: HomePageProps | CategoryPageProps;
    __N_SSP: boolean;
}

/**
 * 完整的 API 响应结构
 */
export interface HupuApiResponse {
    props: ApiResponseProps;
    page: string;
    query: Record<string, any>;
    buildId: string;
    assetPrefix: string;
    isFallback: boolean;
    gssp: boolean;
    scriptLoader: any[];
}

/**
 * 用于区分不同页面类型的类型守卫
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
 * 用于区分不同数据项类型的类型守卫
 */
export function isHomePostItem(item: HomePostItem | NewsDataItem): item is HomePostItem {
    return 'url' in item && 'isNews' in item;
}

export function isNewsDataItem(item: HomePostItem | NewsDataItem): item is NewsDataItem {
    return 'nid' in item && 'link' in item && 'publishTime' in item;
}

// 导出具体类型以供外部使用
export type { ApiResponseProps, Badge, BasketballPageProps, CategoryPageProps, HomePageProps, HomePostItem, NewsDataItem, RecommendMatch, SoccerPageProps };
