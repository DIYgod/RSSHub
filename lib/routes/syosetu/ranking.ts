import { Route, Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import { art } from '@/utils/render';
import path from 'node:path';
import { Context } from 'hono';
import { Genre, Order, SearchBuilder, SearchParams, NarouNovelFetch, BigGenre, GenreNotation } from 'narou';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { getCurrentPath } from '@/utils/helpers';
import querystring from 'querystring';
import { Join } from 'narou/util/type';

const __dirname = getCurrentPath(import.meta.url);

enum RankingPeriod {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTER = 'quarter',
    YEARLY = 'yearly',
    TOTAL = 'total',
}

enum NovelType {
    TOTAL = 'total',
    SHORT = 't',
    ONGOING = 'r',
    COMPLETE = 'er',
}

enum IsekaiCategory {
    RENAI = '1',
    FANTASY = '2',
    OTHER = 'o',
}

enum RankingType {
    LIST = 'list',
    GENRE = 'genre',
    ISEKAI = 'isekai',
}

const periodToOrder: Record<RankingPeriod, Order> = {
    [RankingPeriod.DAILY]: 'dailypoint',
    [RankingPeriod.WEEKLY]: 'weeklypoint',
    [RankingPeriod.MONTHLY]: 'monthlypoint',
    [RankingPeriod.QUARTER]: 'quarterpoint',
    [RankingPeriod.YEARLY]: 'yearlypoint',
    [RankingPeriod.TOTAL]: 'hyoka',
};

const periodToJapanese: Record<RankingPeriod, string> = {
    [RankingPeriod.DAILY]: '日間',
    [RankingPeriod.WEEKLY]: '週間',
    [RankingPeriod.MONTHLY]: '月間',
    [RankingPeriod.QUARTER]: '四半期',
    [RankingPeriod.YEARLY]: '年間',
    [RankingPeriod.TOTAL]: '累計',
};

const novelTypeToJapanese: Record<NovelType, string> = {
    [NovelType.TOTAL]: 'すべて',
    [NovelType.SHORT]: '短編',
    [NovelType.ONGOING]: '連載中',
    [NovelType.COMPLETE]: '完結済',
};

const isekaiCategoryToJapanese: Record<IsekaiCategory, string> = {
    [IsekaiCategory.RENAI]: '〔恋愛〕',
    [IsekaiCategory.FANTASY]: '〔ファンタジー〕',
    [IsekaiCategory.OTHER]: '〔文芸・SF・その他〕',
};

const getParameters = () => {
    // Generate ranking type options
    const rankingTypeOptions = [
        { value: RankingType.LIST, label: '総合ランキング (General Ranking)' },
        { value: RankingType.GENRE, label: 'ジャンル別ランキング (Genre Ranking)' },
        { value: RankingType.ISEKAI, label: '異世界転生/転移ランキング (Isekai Ranking)' },
    ];

    // Generate period options
    const periodOptions = Object.entries(RankingPeriod).map(([key, value]) => ({
        value,
        label: `${periodToJapanese[value]} (${key})`,
    }));

    // Generate novel type options
    const novelTypeOptions = Object.entries(NovelType).map(([key, value]) => ({
        value,
        label: `${novelTypeToJapanese[value]} (${key})`,
    }));

    // Generate genre options
    const genreOptions = Object.entries(Genre)
        .filter(([, value]) => typeof value === 'number') // Filter out reverse mappings
        .map(([key, value]) => ({
            value: value.toString(),
            label: key,
        }));

    // Generate isekai category options
    const isekaiOptions = Object.entries(IsekaiCategory).map(([key, value]) => ({
        value,
        label: `${isekaiCategoryToJapanese[value]} (${key})`,
    }));

    return {
        listType: {
            description: 'Ranking type',
            options: rankingTypeOptions,
        },
        type: {
            description: 'Detailed ranking type, can be found in Syosetu ranking URLs',
            options: [
                // General ranking options
                ...periodOptions.flatMap((period) =>
                    novelTypeOptions.map((novelType) => ({
                        value: `${period.value}_${novelType.value}`,
                        label: `[${periodToJapanese[period.value]}] 総合ランキング - ${novelTypeToJapanese[novelType.value]}`,
                    }))
                ),
                // Genre ranking options
                ...periodOptions.flatMap((period) =>
                    genreOptions.flatMap((genre) =>
                        novelTypeOptions.map((novelType) => ({
                            value: `${period.value}_${genre.value}_${novelType.value}`,
                            label: `[${periodToJapanese[period.value]}] ${GenreNotation[genre.value]}ランキング - ${novelTypeToJapanese[novelType.value]}`,
                        }))
                    )
                ),
                // Isekai ranking options
                ...periodOptions.flatMap((period) =>
                    isekaiOptions.flatMap((category) =>
                        novelTypeOptions.map((novelType) => ({
                            value: `${period.value}_${category.value}_${novelType.value}`,
                            label: `[${periodToJapanese[period.value]}] 異世界転生/転移${isekaiCategoryToJapanese[category.value]}ランキング - ${novelTypeToJapanese[novelType.value]}`,
                        }))
                    )
                ),
            ],
        },
        routeParams: {
            description: 'Optional parameters for limiting results',
            default: 'limit=300',
        },
    };
};

const getBest5RadarItems = () => {
    // List
    const periodRankings = Object.values(RankingPeriod).map((period) => ({
        title: `${periodToJapanese[period]}ランキング BEST5`,
        source: ['yomou.syosetu.com/rank/top/'],
        target: `/ranking/list/${period}_total/limit=5`,
    }));

    // Genre
    const genreRankings = Object.entries(Genre)
        .filter(([, value]) => typeof value === 'number' && value !== 9904 && value !== 9801)
        .map(([, value]) => ({
            title: `[${periodToJapanese.daily}]${GenreNotation[value]}ランキング BEST5`,
            source: ['yomou.syosetu.com/rank/top/'],
            target: `/ranking/genre/daily_${value}_total/limit=5`,
        }));

    // Isekai
    const isekaiRankings = Object.values(IsekaiCategory).map((category) => ({
        title: `[${periodToJapanese.daily}] 異世界転生/転移${isekaiCategoryToJapanese[category]}ランキング BEST5`,
        source: ['yomou.syosetu.com/rank/top/'],
        target: `/ranking/isekai/daily_${category}_total/limit=5`,
    }));

    return [...periodRankings, ...genreRankings, ...isekaiRankings];
};

export const route: Route = {
    path: '/ranking/:listType/:type/:routeParams?',
    categories: ['reading'],
    example: '/syosetu/ranking/list/daily_total/limit=50',
    parameters: getParameters(),
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Rankings',
    maintainers: ['SnowAgar25'],
    handler,
    description: `
Support various ranking types:
1. 総合ランキング \`list\`
2. ジャンル別ランキング \`genre\`
3. 異世界転生/転移ランキング \`isekai\`

Note: The "注目度ランキング" (Attention Ranking) is not supported as syosetu does not provide a public API for this feature and the results cannot be replicated through the search API.
注意事項：「注目度ランキング」については、API が非公開で検索 API でも同様の結果を得ることができないため、本 Route ではサポートしておりません。

Period options:
| Period | Description |
| --- | --- |
| daily | Daily Ranking |
| weekly | Weekly Ranking |
| monthly | Monthly Ranking |
| quarter | Quarterly Ranking |
| yearly | Yearly Ranking |

Novel type options (not all available for every ranking):
| Type | Description |
| --- | --- |
| total | All Works |
| t | Short Stories |
| r | Ongoing Series |
| er | Completed Series |

For \`isekai\` ranking type:
When multiple works have the same points, their order may differ from syosetu's ranking as syosetu randomizes the order for works with identical points.
異世界転生/転移ランキングについて：
集計の結果、同じポイントの作品が複数存在する場合、Syosetu ではランダムで順位が決定されるため、本 Route の順位と異なる場合があります。
`,
    radar: [
        {
            source: ['yomou.syosetu.com/rank/list/type/:type'],
            target: '/ranking/list/:type',
        },
        {
            source: ['yomou.syosetu.com/rank/genrelist/type/:type'],
            target: '/ranking/genre/:type',
        },
        {
            source: ['yomou.syosetu.com/rank/isekailist/type/:type'],
            target: '/ranking/isekai/:type',
        },
        ...getBest5RadarItems(),
    ],
};

function parseGeneralRankingType(type: string): { period: RankingPeriod; novelType: NovelType } {
    const [periodStr, novelTypeStr] = type.split('_');

    const period = periodStr as RankingPeriod;
    const novelType = novelTypeStr as NovelType;

    if (!Object.values(RankingPeriod).includes(period) || !Object.values(NovelType).includes(novelType)) {
        throw new InvalidParameterError(`Invalid general ranking type: ${type}`);
    }

    return { period, novelType };
}

function parseGenreRankingType(type: string): { period: RankingPeriod; genre: number; novelType: NovelType } {
    const [periodStr, genreStr, novelTypeStr = NovelType.TOTAL] = type.split('_');

    const period = periodStr as RankingPeriod;
    const genre = Number(genreStr) as Genre;
    const novelType = novelTypeStr as NovelType;

    if (!Object.values(RankingPeriod).includes(period) || !Object.values(Genre).includes(genre) || genre === 9904 || genre === 9801 || !Object.values(NovelType).includes(novelType)) {
        throw new InvalidParameterError(`Invalid genre ranking type: ${type}`);
    }

    return { period, genre, novelType };
}

function parseIsekaiRankingType(type: string): { period: RankingPeriod; category: IsekaiCategory; novelType: NovelType } {
    const [periodStr, categoryStr, novelTypeStr = NovelType.TOTAL] = type.split('_');

    const period = periodStr as RankingPeriod;
    const category = categoryStr as IsekaiCategory;
    const novelType = novelTypeStr as NovelType;

    if (!Object.values(RankingPeriod).includes(period) || !Object.values(IsekaiCategory).includes(category) || !Object.values(NovelType).includes(novelType)) {
        throw new InvalidParameterError(`Invalid isekai ranking type: ${type}`);
    }

    return { period, category, novelType };
}

async function handler(ctx: Context): Promise<Data> {
    const { listType, type } = ctx.req.param();
    const rankingType = listType as RankingType;
    const routeParams = querystring.parse(ctx.req.param('routeParams'));
    const limit = Number(routeParams.limit || 300);

    const api = new NarouNovelFetch();
    const searchParams: SearchParams = {
        gzip: 5,
        lim: 300,
    };

    let rankingUrl: string;
    let rankingTitle: string;

    // Build search parameters and titles based on ranking type
    switch (rankingType) {
        case RankingType.LIST: {
            const { period, novelType } = parseGeneralRankingType(type);
            rankingUrl = `https://yomou.syosetu.com/rank/list/type/${type}`;
            rankingTitle = `[${periodToJapanese[period]}] 総合ランキング - ${novelTypeToJapanese[novelType]}`;

            searchParams.order = periodToOrder[period];
            if (novelType !== NovelType.TOTAL) {
                searchParams.type = novelType;
            }
            break;
        }

        case RankingType.GENRE: {
            const { period, genre, novelType } = parseGenreRankingType(type);
            rankingUrl = `https://yomou.syosetu.com/rank/genrelist/type/${type}`;
            rankingTitle = `[${periodToJapanese[period]}] ${GenreNotation[genre]}ランキング - ${novelTypeToJapanese[novelType]}`;

            searchParams.order = periodToOrder[period];
            searchParams.genre = genre as Genre;
            if (novelType !== NovelType.TOTAL) {
                searchParams.type = novelType;
            }
            break;
        }

        case RankingType.ISEKAI: {
            const { period, category, novelType } = parseIsekaiRankingType(type);
            rankingUrl = `https://yomou.syosetu.com/rank/isekailist/type/${type}`;
            rankingTitle = `[${periodToJapanese[period]}] 異世界転生/転移${isekaiCategoryToJapanese[category]}ランキング - ${novelTypeToJapanese[novelType]}`;

            searchParams.order = periodToOrder[period];

            if (novelType !== NovelType.TOTAL) {
                searchParams.type = novelType;
            }

            switch (category) {
                case IsekaiCategory.RENAI:
                    searchParams.biggenre = BigGenre.Renai;
                    break;
                case IsekaiCategory.FANTASY:
                    searchParams.biggenre = BigGenre.Fantasy;
                    break;
                case IsekaiCategory.OTHER:
                    searchParams.biggenre = `${BigGenre.Bungei}-${BigGenre.Sf}-${BigGenre.Sonota}` as Join<BigGenre>;
                    break;
                default:
                    throw new InvalidParameterError(`Invalid Isekai category: ${category}`);
            }

            const items = await cache.tryGet(rankingUrl, async () => {
                searchParams.lim = 150;
                const [tenseiResult, tenniResult] = await Promise.all([new SearchBuilder({ ...searchParams, istensei: 1 }, api).execute(), new SearchBuilder({ ...searchParams, istenni: 1 }, api).execute()]);

                // Combine and sort by points
                const combinedNovels = [...tenseiResult.values, ...tenniResult.values];

                // Remove duplicates based on ncode
                const uniqueNovels = [...new Map(combinedNovels.map((novel) => [novel.ncode, novel])).values()];

                // Sort by relevant point type based on period
                const pointField = (() => {
                    switch (period) {
                        case RankingPeriod.DAILY:
                            return 'pt';
                        case RankingPeriod.WEEKLY:
                            return 'weekly_point';
                        case RankingPeriod.MONTHLY:
                            return 'monthly_point';
                        case RankingPeriod.QUARTER:
                            return 'quarter_point';
                        case RankingPeriod.YEARLY:
                            return 'yearly_point';
                        case RankingPeriod.TOTAL:
                            return 'global_point';
                        default:
                            throw new InvalidParameterError(`Invalid period: ${period}`);
                    }
                })();

                return uniqueNovels
                    .sort((a, b) => (b[pointField] || 0) - (a[pointField] || 0))
                    .map((novel, index) => ({
                        title: `#${index + 1} ${novel.title}`,
                        link: `https://ncode.syosetu.com/${String(novel.ncode).toLowerCase()}`,
                        description: art(path.join(__dirname, 'templates', 'description.art'), {
                            novel,
                        }),
                        author: novel.writer,
                        category: novel.keyword.split(/[\s/\uFF0F]/).filter(Boolean),
                    }));
            });

            return {
                title: `小説家になろう - ${rankingTitle}`,
                link: rankingUrl,
                item: (items as DataItem[]).slice(0, limit),
                language: 'ja',
            };
        }

        default:
            throw new InvalidParameterError(`Invalid ranking type: ${type}`);
    }

    const builder = new SearchBuilder(searchParams, api);

    const items = (await cache.tryGet(rankingUrl, async () => {
        const result = await builder.execute();

        return result.values.map((novel, index) => ({
            title: `#${index + 1} ${novel.title}`,
            link: `https://ncode.syosetu.com/${String(novel.ncode).toLowerCase()}`,
            description: art(path.join(__dirname, 'templates', 'description.art'), {
                novel,
            }),
            author: novel.writer,
            category: novel.keyword.split(/[\s/\uFF0F]/).filter(Boolean),
        }));
    })) as DataItem[];

    return {
        title: `小説家になろう - ${rankingTitle}`,
        link: rankingUrl,
        item: items.slice(0, limit),
        language: 'ja',
    };
}
