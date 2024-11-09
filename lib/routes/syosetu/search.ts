import { Route, Data } from '@/types';
// import cache from '@/utils/cache';
// import { getCurrentPath } from '@/utils/helpers';
// import { art } from '@/utils/render';
// import path from 'node:path';
import { Context } from 'hono';
import { Genre, NarouNovelFetch, NovelTypeParam, Order, R18Site, SearchBuilder, SearchBuilderR18, SearchParams } from 'narou';
import queryString from 'query-string';
import { Join } from 'narou/util/type';
import InvalidParameterError from '@/errors/types/invalid-parameter';

interface NarouSearchParams {
    /**
     * 作品種別の絞り込み Work Type Filter
     *
     * t 短編 Short
     * r 連載中 Ongoing Series
     * er 完結済連載作品 Completed Series
     * re すべての連載作品 (連載中および完結済) Series and Completed Series
     * ter 短編と完結済連載作品 Completed Works (Including Short and Series)
     *
     * tr 短編と連載中小説 Short and Ongoing Series
     * all 全ての種別 (Default) All Types
     *
     * Note: While the official documentation describes 5 values, all 7 values above are functional.
     */
    type?: 't' | 'r' | 'er' | 're' | 'ter' | 'tr' | 'all';

    /** 検索ワード Search Keywords */
    word?: string;

    /** 除外ワード Excluded Keywords */
    notword?: string;

    /**
     * 検索範囲指定 Search Range Specifications
     *
     * - 読了時間 Reading Time
     * - 文字数 Character Count
     * - 総合ポイント Total Points
     * - 最新掲載日（年月日）Latest Update Date (Year/Month/Day)
     * - 初回掲載日（年月日）First Publication Date (Year/Month/Day)
     */
    mintime?: number;
    maxtime?: number;
    minlen?: number;
    maxlen?: number;
    min_globalpoint?: number;
    max_globalpoint?: number;
    minlastup?: string;
    maxlastup?: string;
    minfirstup?: string;
    maxfirstup?: string;

    /**
     * 抽出条件の指定 Extraction Conditions
     *
     * - 挿絵のある作品 Works with Illustrations
     * - 小説 PickUp！対象作品 Featured Novels
     *
     * 作品に含まれる要素：Elements Included in Works:
     * - 残酷な描写あり Contains Cruel Content
     * - ボーイズラブ Boys' Love
     * - ガールズラブ Girls' Love
     * - 異世界転生 Reincarnation in Another World
     * - 異世界転移 Transportation to Another World
     */
    sasie?: string;
    ispickup?: boolean;
    iszankoku?: boolean;
    isbl?: boolean;
    isgl?: boolean;
    istensei?: boolean;
    istenni?: boolean;

    /**
     * 除外条件の指定 Exclusion Conditions
     *
     * - 長期連載停止中の作品 Works on Long-term Hiatus
     *
     * 作品に含まれる要素：Elements to Exclude:
     * - 残酷な描写あり Cruel Content
     * - ボーイズラブ Boys' Love
     * - ガールズラブ Girls' Love
     * - 異世界転生 Reincarnation in Another World
     * - 異世界転移 Transportation to Another World
     */
    stop?: boolean;
    notzankoku?: boolean;
    notbl?: boolean;
    notgl?: boolean;
    nottensei?: boolean;
    nottenni?: boolean;

    /**
     * ワード検索範囲指定 Word Search Scope
     * すべてのチェックを解除した場合、すべての項目がワード検索の対象となります。
     * If all boxes are unchecked, all items will become targets for word search.
     *
     * 作品タイトル Work Title
     * あらすじ Synopsis
     * キーワード Keywords
     * 作者名 Author Name
     */
    title?: boolean;
    ex?: boolean;
    keyword?: boolean;
    wname?: boolean;

    /**
     * 並び順 Sort Order
     * - new: 新着更新順 (Default) Latest Updates
     * - weekly: 週間ユニークアクセスが多い順 Most Weekly Unique Access
     * - favnovelcnt: ブックマーク登録の多い順 Most Bookmarks
     * - reviewcnt: レビューの多い順 Most Reviews
     * - hyoka: 総合ポイントの高い順 Highest Total Points
     * - dailypoint: 日間ポイントの高い順 Highest Daily Points
     * - weeklypoint: 週間ポイントの高い順 Highest Weekly Points
     * - monthlypoint: 月間ポイントの高い順 Highest Monthly Points
     * - quarterpoint: 四半期ポイントの高い順 Highest Quarterly Points
     * - yearlypoint: 年間ポイントの高い順 Highest Yearly Points
     * - hyokacnt: 評価者数の多い順 Most Ratings
     * - lengthdesc: 文字数の多い順 Most Characters
     * - generalfirstup: 初回掲載順 First Publication Order
     * - ncodedesc: N コード降順 Ncode Descending
     * - old: 更新が古い順 Oldest Updates
     */
    order?: 'new' | 'weekly' | 'favnovelcnt' | 'reviewcnt' | 'hyoka' | 'dailypoint' | 'weeklypoint' | 'monthlypoint' | 'quarterpoint' | 'yearlypoint' | 'hyokacnt' | 'lengthdesc' | 'generalfirstup' | 'ncodedesc' | 'old';

    /** ジャンル Genre */
    genre?: string;

    /** 掲載サイト指定 Site */
    nocgenre?: number;
}

// const render = (novel) =>
//     art(path.join(getCurrentPath(import.meta.url), 'templates', 'result.art'), novel);

export const route: Route = {
    path: '/search/:domain/:query',
    categories: ['reading'],
    example: '/syosetu/search/noc/word=ハーレム&notword=&type=r&mintime=&maxtime=&minlen=30000&maxlen=&min_globalpoint=&max_globalpoint=&minlastup=&maxlastup=&minfirstup=&maxfirstup=&isgl=1&notbl=1&order=new',
    parameters: {
        domain: 'The target Syosetu site domain (yomou/noc/mnlt/mid).',
        query: 'Search parameters in Syosetu format.',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search',
    maintainers: ['SnowAgar25'],
    handler,
};

/**
 * This function converts query string generated by Syosetu website into API-compatible format.
 * It is not intended for users to freely adjust values.
 *
 * @see https://deflis.github.io/node-narou/index.html
 * @see https://dev.syosetu.com/man/api/
 */
function mapToSearchParams(query: string): SearchParams {
    const params = queryString.parse(query) as NarouSearchParams;

    const searchParams: SearchParams = {
        gzip: 5,
        lim: 40,
    };

    // 検索ワード関連のパラメータ / Search word related parameters
    params.word && (searchParams.word = params.word);
    params.notword && (searchParams.notword = params.notword);

    // 検索範囲フラグ / Search scope flags
    params.title && (searchParams.title = 1);
    params.ex && (searchParams.ex = 1);
    params.keyword && (searchParams.keyword = 1);
    params.wname && (searchParams.wname = 1);

    // Include
    params.iszankoku && (searchParams.iszankoku = 1);
    params.isbl && (searchParams.isbl = 1);
    params.isgl && (searchParams.isgl = 1);
    params.istensei && (searchParams.istensei = 1);
    params.istenni && (searchParams.istenni = 1);

    // Exclude
    params.stop && (searchParams.stop = 1);
    params.notzankoku && (searchParams.notzankoku = 1);
    params.notbl && (searchParams.notbl = 1);
    params.notgl && (searchParams.notgl = 1);
    params.nottensei && (searchParams.nottensei = 1);
    params.nottenni && (searchParams.nottenni = 1);

    // 読了時間の処理 / Reading Time range processing
    params.minlen && (searchParams.minlen = params.minlen);
    params.maxlen && (searchParams.maxlen = params.maxlen);

    // 特殊パラメータ / Special parameters
    params.type && (searchParams.type = params.type as NovelTypeParam);
    params.order && (searchParams.order = params.order as Order);

    params.genre && (searchParams.genre = params.genre as Join<Genre> | Genre);
    params.nocgenre && (searchParams.nocgenre = params.nocgenre as Join<R18Site> | R18Site);

    params.sasie === '1-' && (searchParams.sasie = '1-');
    (params.mintime || params.maxtime) && (searchParams.time = `${params.mintime || ''}-${params.maxtime || ''}`);

    return searchParams;
}

enum SyosetuDomain {
    NORMAL = 'yomou',
    NOCTURNE = 'noc',
    MOONLIGHT = 'mnlt',
    MIDNIGHT = 'mid',
}

const isGeneral = (domain: string): boolean => domain === SyosetuDomain.NORMAL;

function createNovelSearchBuilder(domain: string, searchParams: SearchParams) {
    if (isGeneral(domain)) {
        return new SearchBuilder(searchParams, new NarouNovelFetch());
    }

    const r18Params = { ...searchParams };

    switch (domain) {
        case SyosetuDomain.NOCTURNE:
            r18Params.nocgenre = '1';
            break;
        case SyosetuDomain.MOONLIGHT:
            // If either 女性向け/BL is chosen, nocgenre will be in query string
            // If no specific genre selected, include both
            if (!r18Params.nocgenre) {
                r18Params.nocgenre = '2-3';
            }
            break;
        case SyosetuDomain.MIDNIGHT:
            r18Params.nocgenre = '4';
            break;
        default:
            throw new InvalidParameterError('Invalid Syosetu subdomain.\nValid subdomains are: yomou, noc, mnlt, mid');
    }

    return new SearchBuilderR18(r18Params, new NarouNovelFetch());
}

async function handler(ctx: Context): Promise<Data> {
    const { domain, query } = ctx.req.param();
    const searchUrl = `https://${domain}.syosetu.com/search/search/search.php?${query}`;

    const searchParams = mapToSearchParams(query);
    const builder = createNovelSearchBuilder(domain, searchParams);
    const result = await builder.execute();

    // TODO: richer feed, cache
    const items = result.values.map((novel) => ({
        title: novel.title,
        link: `https://${isGeneral(domain) ? 'ncode' : 'novel18'}.syosetu.com/${String(novel.ncode).toLowerCase()}`,
        description: novel.story,
        // Skip pubDate - search results prioritize search sequence over timestamps
        // pubDate: novel.general_lastup,
        author: novel.writer,
    }));

    return {
        title: `Syosetu Search`,
        link: searchUrl,
        item: items,
    };
}
