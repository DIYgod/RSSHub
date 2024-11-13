import { Route, Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import { art } from '@/utils/render';
import path from 'node:path';
import { Context } from 'hono';
import { Order, R18Site, SearchBuilderR18, SearchParams, NarouNovelFetch } from 'narou';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { getCurrentPath } from '@/utils/helpers';
import querystring from 'querystring';

const __dirname = getCurrentPath(import.meta.url);

/**
 * Implementation of "Syosetu" R18 Rankings
 *
 * While "Syosetu" only provides ranking API for "Syosetu o yomou" (general audience),
 * equivalent ranking functionality can be achieved using the point-based sorting in the search API.
 *
 * This implementation utilizes the 'order' parameter (e.g., dailypoint, weeklypoint)
 * of the search API to replicate ranking functionality across all Syosetu subsidiary sites.
 */

enum SyosetuSub {
    NOCTURNE = 'noc',
    MOONLIGHT = 'mnlt',
    MOONLIGHT_BL = 'mnlt-bl',
    MIDNIGHT = 'mid',
}

enum RankingPeriod {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTER = 'quarter',
    YEARLY = 'yearly',
}

enum NovelType {
    TOTAL = 'total',
    SHORT = 't',
    ONGOING = 'r',
    COMPLETE = 'er',
}

const periodToOrder: Record<RankingPeriod, Order> = {
    [RankingPeriod.DAILY]: 'dailypoint',
    [RankingPeriod.WEEKLY]: 'weeklypoint',
    [RankingPeriod.MONTHLY]: 'monthlypoint',
    [RankingPeriod.QUARTER]: 'quarterpoint',
    [RankingPeriod.YEARLY]: 'yearlypoint',
};

const periodToJapanese: Record<RankingPeriod, string> = {
    [RankingPeriod.DAILY]: '日間',
    [RankingPeriod.WEEKLY]: '週間',
    [RankingPeriod.MONTHLY]: '月間',
    [RankingPeriod.QUARTER]: '四半期',
    [RankingPeriod.YEARLY]: '年間',
};

const novelTypeToJapanese: Record<NovelType, string> = {
    [NovelType.TOTAL]: '総合',
    [NovelType.SHORT]: '短編',
    [NovelType.ONGOING]: '連載中',
    [NovelType.COMPLETE]: '完結済',
};

const getParameters = () => {
    // Generate options for sub parameter
    const subOptions = [
        { value: 'noc', label: 'Nocturne' },
        { value: 'mid', label: 'Midnight' },
        { value: 'mnlt', label: 'Moonlight' },
        { value: 'mnlt-bl', label: 'Moonlight BL' },
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

    return {
        sub: {
            description: 'Target site for R18 rankings',
            options: subOptions,
        },
        type: {
            description: 'Ranking type (format: period_noveltype)',
            options: periodOptions.flatMap((period) =>
                novelTypeOptions.map((type) => ({
                    value: `${period.value}_${type.value}`,
                    label: `${period.label} ${type.label}`,
                }))
            ),
        },
        routeParams: {
            description: 'Optional parameters',
            default: 'limit=300',
        },
    };
};

export const route: Route = {
    path: '/rankingr18/:sub/:type/:routeParams?',
    categories: ['reading'],
    example: '/syosetu/rankingr18/noc/daily_total/limit=50',
    parameters: getParameters(),
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'R18 Rankings',
    maintainers: ['SnowAgar25'],
    handler,
    description: `
| Period | Description | 説明 |
| --- | --- | --- |
| daily | Daily Ranking | 日間ランキング |
| weekly | Weekly Ranking | 週間ランキング |
| monthly | Monthly Ranking | 月間ランキング |
| quarter | Quarterly Ranking | 四半期ランキング |
| yearly | Yearly Ranking | 年間ランキング |

| Novel Type | Description | 説明 |
| --- | --- | --- | --- |
| total | All Works | 総合 |
| t | Short Stories | 短編 |
| r | Ongoing Series | 連載中 |
| er | Completed Series | 完結済 |

Note: Combine Period and Novel Type with \`_\`. For example: \`daily_total\`, \`weekly_r\`, \`monthly_er\``,
    radar: [
        {
            source: ['noc.syosetu.com/rank/top/', 'noc.syosetu.com/rank/list/type/:type'],
            target: '/rankingr18/noc/:type',
        },
        {
            source: ['mid.syosetu.com/rank/top/', 'mid.syosetu.com/rank/list/type/:type'],
            target: '/rankingr18/mid/:type',
        },
        {
            source: ['mnlt.syosetu.com/rank/top/', 'mnlt.syosetu.com/rank/list/type/:type'],
            target: '/rankingr18/mnlt/:type',
        },
        {
            source: ['mnlt.syosetu.com/rank/bltop/', 'mnlt.syosetu.com/rank/bllist/type/:type'],
            target: '/rankingr18/mnlt-bl/:type',
        },
    ],
};

function parseRankingType(type: string): { period: RankingPeriod; novelType: NovelType } {
    const [periodStr, novelTypeStr] = type.split('_');

    const period = periodStr as RankingPeriod;
    const novelType = novelTypeStr as NovelType;

    if (!Object.values(RankingPeriod).includes(period) || !Object.values(NovelType).includes(novelType)) {
        throw new InvalidParameterError(`Invalid ranking type: ${type}`);
    }

    return {
        period: periodStr as RankingPeriod,
        novelType: novelTypeStr as NovelType,
    };
}

function getRankingTitle(type: string): string {
    const { period, novelType } = parseRankingType(type);
    return `${periodToJapanese[period]}${novelTypeToJapanese[novelType]}ランキング`;
}

async function handler(ctx: Context): Promise<Data> {
    const { sub, type } = ctx.req.param();
    const baseUrl = `https://${sub === 'mnlt-bl' ? 'mnlt' : sub}.syosetu.com`;
    const rankingUrl = `${baseUrl}/rank/list/type/${type}`;
    const api = new NarouNovelFetch();

    const routeParams = querystring.parse(ctx.req.param('routeParams'));
    const limit = Number(routeParams.limit || 300);

    const { period, novelType } = parseRankingType(type);

    const searchParams: SearchParams = {
        gzip: 5,
        lim: 300,
        order: periodToOrder[period],
    };

    // TOTAL: Skip type filter to get all types combined
    if (novelType !== NovelType.TOTAL) {
        searchParams.type = novelType;
    }

    const nocgenre = (() => {
        switch (sub) {
            case SyosetuSub.NOCTURNE:
                return R18Site.Nocturne;
            case SyosetuSub.MOONLIGHT:
                return R18Site.MoonLight;
            case SyosetuSub.MOONLIGHT_BL:
                return R18Site.MoonLightBL;
            case SyosetuSub.MIDNIGHT:
                return R18Site.Midnight;
            default:
                throw new InvalidParameterError(`Invalid subsite: ${sub}`);
        }
    })();

    const builder = new SearchBuilderR18(searchParams, api).r18Site(nocgenre);

    const items = (await cache.tryGet(rankingUrl, async () => {
        const result = await builder.execute();

        return result.values.map((novel, index) => ({
            title: `#${index + 1} ${novel.title}`,
            link: `https://novel18.syosetu.com/${String(novel.ncode).toLowerCase()}`,
            description: art(path.join(__dirname, 'templates', 'description.art'), {
                novel,
            }),
            author: novel.writer,
            category: novel.keyword.split(/[/\uFF0F\s]/).filter(Boolean),
        }));
    })) as DataItem[];

    return {
        title: `小説家になろう (${sub}) - ${getRankingTitle(type)}`,
        link: rankingUrl,
        item: items.slice(0, limit),
        language: 'ja',
    };
}
