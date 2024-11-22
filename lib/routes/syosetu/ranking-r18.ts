import { Route, Data, DataItem } from '@/types';
import { art } from '@/utils/render';
import path from 'node:path';
import { Context } from 'hono';
import { SearchBuilderR18, SearchParams, NarouNovelFetch } from 'narou';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { getCurrentPath } from '@/utils/helpers';
import { RankingPeriod, periodToJapanese, novelTypeToJapanese, periodToOrder, NovelType, SyosetuSub, syosetuSubToJapanese, syosetuSubToNocgenre } from './types/ranking-r18';

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

const getParameters = () => {
    // Generate options for sub parameter
    const subOptions = Object.entries(SyosetuSub).map(([, value]) => ({
        value,
        label: syosetuSubToJapanese[value],
    }));

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
            description: 'Detailed ranking type (format: period_noveltype)',
            options: periodOptions.flatMap((period) =>
                novelTypeOptions.map((type) => ({
                    value: `${period.value}_${type.value}`,
                    label: `${period.label} ${type.label}`,
                }))
            ),
        },
    };
};

const getBest5RadarItems = () =>
    Object.entries(SyosetuSub).flatMap(([, domain]) =>
        Object.values(RankingPeriod).map((period) => ({
            title: `${syosetuSubToJapanese[domain]} ${periodToJapanese[period]}ランキング BEST5`,
            source: [`${domain === SyosetuSub.MOONLIGHT_BL ? SyosetuSub.MOONLIGHT : domain}.syosetu.com/rank/${domain === SyosetuSub.MOONLIGHT_BL ? 'bltop' : 'top'}`],
            target: `/rankingr18/${domain}/${period}_${NovelType.TOTAL}?limit=5`,
        }))
    );

export const route: Route = {
    path: '/rankingr18/:sub/:type',
    categories: ['reading'],
    example: '/syosetu/rankingr18/noc/daily_total?limit=50',
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
            source: ['noc.syosetu.com/rank/list/type/:type'],
            target: '/rankingr18/noc/:type',
        },
        {
            source: ['mid.syosetu.com/rank/list/type/:type'],
            target: '/rankingr18/mid/:type',
        },
        {
            source: ['mnlt.syosetu.com/rank/list/type/:type'],
            target: '/rankingr18/mnlt/:type',
        },
        {
            source: ['mnlt.syosetu.com/rank/bllist/type/:type'],
            target: '/rankingr18/mnlt-bl/:type',
        },
        ...getBest5RadarItems(),
    ],
};

function parseRankingType(type: string): { period: RankingPeriod; novelType: NovelType } {
    const [periodStr, novelTypeStr] = type.split('_');

    const period = periodStr as RankingPeriod;
    const novelType = novelTypeStr as NovelType;

    const isValid = [Object.values(RankingPeriod).includes(period), Object.values(NovelType).includes(novelType)].every(Boolean);

    if (!isValid) {
        throw new InvalidParameterError(`Invalid ranking type: ${type}`);
    }

    return {
        period: periodStr as RankingPeriod,
        novelType: novelTypeStr as NovelType,
    };
}

function getRankingTitle(type: string, limit: number): string {
    const { period, novelType } = parseRankingType(type);
    return `${periodToJapanese[period]}${novelTypeToJapanese[novelType]}ランキング BEST${limit}`;
}

async function handler(ctx: Context): Promise<Data> {
    const { sub, type } = ctx.req.param();
    const baseUrl = `https://${sub === SyosetuSub.MOONLIGHT_BL ? SyosetuSub.MOONLIGHT : sub}.syosetu.com`;
    const rankingUrl = `${baseUrl}/rank/list/type/${type}`;
    const api = new NarouNovelFetch();

    const limit = Math.min(Number(ctx.req.query('limit') ?? 300), 300);
    const { period, novelType } = parseRankingType(type);

    const searchParams: SearchParams = {
        gzip: 5,
        lim: limit,
        order: periodToOrder[period],
    };

    // TOTAL: Skip type filter to get all types combined
    if (novelType !== NovelType.TOTAL) {
        searchParams.type = novelType;
    }

    if (!(sub in syosetuSubToNocgenre)) {
        throw new InvalidParameterError(`Invalid subsite: ${sub}`);
    }
    const nocgenre = syosetuSubToNocgenre[sub];

    const builder = new SearchBuilderR18(searchParams, api).r18Site(nocgenre);
    const result = await builder.execute();

    const items = result.values.map((novel, index) => ({
        title: `#${index + 1} ${novel.title}`,
        link: `https://novel18.syosetu.com/${String(novel.ncode).toLowerCase()}`,
        description: art(path.join(__dirname, 'templates', 'description.art'), {
            novel,
        }),
        author: novel.writer,
        category: novel.keyword.split(/[\s/\uFF0F]/).filter(Boolean),
    }));

    return {
        title: `小説家になろう (${sub}) - ${getRankingTitle(type, limit)}`,
        link: rankingUrl,
        item: items as DataItem[],
        language: 'ja',
    };
}
