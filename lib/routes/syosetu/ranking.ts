import type { Context } from 'hono';
import type { SearchParams } from 'narou';
import { Genre, GenreNotation, NarouNovelFetch, SearchBuilder } from 'narou';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';

import { handleIsekaiRanking } from './ranking-isekai';
import { renderDescription } from './templates/description';
import { IsekaiCategory, isekaiCategoryToJapanese, NovelType, novelTypeToJapanese, periodToJapanese, periodToOrder, RankingPeriod, RankingType } from './types/ranking';

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
                        label: `${RankingType.LIST} - [${periodToJapanese[period.value]}] 総合ランキング - ${novelTypeToJapanese[novelType.value]}`,
                    }))
                ),
                // Genre ranking options
                ...periodOptions.flatMap((period) =>
                    genreOptions.flatMap((genre) =>
                        novelTypeOptions.map((novelType) => ({
                            value: `${period.value}_${genre.value}_${novelType.value}`,
                            label: `${RankingType.GENRE} - [${periodToJapanese[period.value]}] ${GenreNotation[genre.value]}ランキング - ${novelTypeToJapanese[novelType.value]}`,
                        }))
                    )
                ),
                // Isekai ranking options
                ...periodOptions.flatMap((period) =>
                    isekaiOptions.flatMap((category) =>
                        novelTypeOptions.map((novelType) => ({
                            value: `${period.value}_${category.value}_${novelType.value}`,
                            label: `${RankingType.ISEKAI} - [${periodToJapanese[period.value]}] 異世界転生/転移${isekaiCategoryToJapanese[category.value]}ランキング - ${novelTypeToJapanese[novelType.value]}`,
                        }))
                    )
                ),
            ],
        },
    };
};

const getBest5RadarItems = () => {
    // List
    const periodRankings = Object.values(RankingPeriod).map((period) => ({
        title: `${periodToJapanese[period]}ランキング BEST5`,
        source: ['yomou.syosetu.com/rank/top/'],
        target: `/ranking/list/${period}_total?limit=5`,
    }));

    // Genre
    const genreRankings = Object.entries(Genre)
        .filter(([, value]) => typeof value === 'number' && value !== Genre.SonotaReplay && value !== Genre.NonGenre)
        .map(([, value]) => ({
            title: `[${periodToJapanese.daily}] ${GenreNotation[value]}ランキング BEST5`,
            source: ['yomou.syosetu.com/rank/top/'],
            target: `/ranking/genre/daily_${value}_total?limit=5`,
        }));

    // Isekai
    const isekaiRankings = Object.values(IsekaiCategory).map((category) => ({
        title: `[${periodToJapanese.daily}] 異世界転生/転移${isekaiCategoryToJapanese[category]}ランキング BEST5`,
        source: ['yomou.syosetu.com/rank/top/'],
        target: `/ranking/isekai/daily_${category}_total?limit=5`,
    }));

    return [...periodRankings, ...genreRankings, ...isekaiRankings];
};

export const route: Route = {
    path: '/ranking/:listType/:type',
    categories: ['reading'],
    example: '/syosetu/ranking/list/daily_total?limit=50',
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
    url: 'yomou.syosetu.com/rank/top',
    maintainers: ['SnowAgar25'],
    handler,
    description: `
| Keyword | Description | 説明 |
| --- | --- | --- |
| list | Overall Ranking | 総合ランキング |
| genre | Genre Ranking | ジャンル別ランキング |
| isekai | Isekai/Reincarnation/Transfer Ranking | 異世界転生/転移ランキング |

| Period | Description |
| --- | --- |
| daily | Daily Ranking |
| weekly | Weekly Ranking |
| monthly | Monthly Ranking |
| quarter | Quarterly Ranking |
| yearly | Yearly Ranking |


| Type | Description |
| --- | --- |
| total | All Works |
| t | Short Stories |
| r | Ongoing Series |
| er | Completed Series |

::: warning
Please note that novel type options may vary depending on the ranking category.

ランキングの種類によって、小説タイプが異なる場合がございますのでご注意ください。
:::

::: danger 注意事項
The "注目度ランキング" (Attention Ranking) is not supported as syosetu does not provide a public API for this feature and the results cannot be replicated through the search API.

「注目度ランキング」については、API が非公開で検索 API でも同様の結果を得ることができないため、本 Route ではサポートしておりません。
:::

::: tip 異世界転生/転移ランキングについて (Isekai)
When multiple works have the same points, their order may differ from syosetu's ranking as syosetu randomizes the order for works with identical points.

集計の結果、同じポイントの作品が複数存在する場合、Syosetu ではランダムで順位が決定されるため、本 Route の順位と異なる場合があります。
:::
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

    const isValid = [Object.values(RankingPeriod).includes(period), Object.values(NovelType).includes(novelType)].every(Boolean);

    if (!isValid) {
        throw new InvalidParameterError(`Invalid general ranking type: ${type}`);
    }

    return { period, novelType };
}

function parseGenreRankingType(type: string): { period: RankingPeriod; genre: number; novelType: NovelType } {
    const [periodStr, genreStr, novelTypeStr = NovelType.TOTAL] = type.split('_');

    const period = periodStr as RankingPeriod;
    const genre = Number(genreStr) as Genre;
    const novelType = novelTypeStr as NovelType;

    const isValid = [Object.values(RankingPeriod).includes(period), Object.values(Genre).includes(genre), Object.values(NovelType).includes(novelType), genre !== Genre.SonotaReplay, genre !== Genre.NonGenre].every(Boolean);

    if (!isValid) {
        throw new InvalidParameterError(`Invalid genre ranking type: ${type}`);
    }

    return { period, genre, novelType };
}

async function handler(ctx: Context): Promise<Data> {
    const { listType, type } = ctx.req.param();
    const rankingType = listType as RankingType;
    const limit = Math.min(Number(ctx.req.query('limit') ?? 300), 300);

    const api = new NarouNovelFetch();
    const searchParams: SearchParams = {
        gzip: 5,
        lim: limit,
    };

    let rankingUrl: string;
    let rankingTitle: string;

    // Build search parameters and titles based on ranking type
    switch (rankingType) {
        case RankingType.LIST: {
            const { period, novelType } = parseGeneralRankingType(type);
            rankingUrl = `https://yomou.syosetu.com/rank/list/type/${type}`;
            rankingTitle = `[${periodToJapanese[period]}] 総合ランキング - ${novelTypeToJapanese[novelType]} BEST${limit}`;

            searchParams.order = periodToOrder[period];
            if (novelType !== NovelType.TOTAL) {
                searchParams.type = novelType;
            }
            break;
        }

        case RankingType.GENRE: {
            const { period, genre, novelType } = parseGenreRankingType(type);
            rankingUrl = `https://yomou.syosetu.com/rank/genrelist/type/${type}`;
            rankingTitle = `[${periodToJapanese[period]}] ${GenreNotation[genre]}ランキング - ${novelTypeToJapanese[novelType]} BEST${limit}`;

            searchParams.order = periodToOrder[period];
            searchParams.genre = genre as Genre;
            if (novelType !== NovelType.TOTAL) {
                searchParams.type = novelType;
            }
            break;
        }

        case RankingType.ISEKAI:
            return handleIsekaiRanking(type, limit);

        default:
            throw new InvalidParameterError(`Invalid ranking type: ${type}`);
    }

    const builder = new SearchBuilder(searchParams, api);
    const result = await builder.execute();

    const items = result.values.map((novel, index) => ({
        title: `#${index + 1} ${novel.title}`,
        link: `https://ncode.syosetu.com/${String(novel.ncode).toLowerCase()}`,
        description: renderDescription({ novel }),
        author: novel.writer,
        category: novel.keyword.split(/[\s/\uFF0F]/).filter(Boolean),
    }));

    return {
        title: `小説家になろう - ${rankingTitle}`,
        link: rankingUrl,
        item: items as DataItem[],
        language: 'ja',
    };
}
