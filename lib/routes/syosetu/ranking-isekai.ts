import path from 'node:path';

import type { SearchParams } from 'narou';
import { BigGenre, NarouNovelFetch, SearchBuilder } from 'narou';
import type { Join } from 'narou/util/type';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem } from '@/types';
import { art } from '@/utils/render';

import { IsekaiCategory, isekaiCategoryToJapanese, NovelType, novelTypeToJapanese, periodToJapanese, periodToOrder, periodToPointField, RankingPeriod } from './types/ranking';

export function parseIsekaiRankingType(type: string): { period: RankingPeriod; category: IsekaiCategory; novelType: NovelType } {
    const [periodStr, categoryStr, novelTypeStr = NovelType.TOTAL] = type.split('_');

    const period = periodStr as RankingPeriod;
    const category = categoryStr as IsekaiCategory;
    const novelType = novelTypeStr as NovelType;

    const isValid = [Object.values(RankingPeriod).includes(period), Object.values(IsekaiCategory).includes(category), Object.values(NovelType).includes(novelType)].every(Boolean);

    if (!isValid) {
        throw new InvalidParameterError(`Invalid isekai ranking type: ${type}`);
    }

    return { period, category, novelType };
}

function getIsekaiSearchParams(period, category, novelType, limit): SearchParams {
    const searchParams: SearchParams = {
        order: periodToOrder[period],
        gzip: 5,
        // Request 20% more items to compensate for potential duplicates between tensei/tenni
        lim: Math.ceil((limit / 2) * 1.2),
    };

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

    return searchParams;
}

export async function handleIsekaiRanking(type: string, limit: number): Promise<Data> {
    const { period, category, novelType } = parseIsekaiRankingType(type);
    const rankingUrl = `https://yomou.syosetu.com/rank/isekailist/type/${type}`;
    const rankingTitle = `[${periodToJapanese[period]}] 異世界転生/転移${isekaiCategoryToJapanese[category]}ランキング - ${novelTypeToJapanese[novelType]} BEST${limit}`;

    const searchParams = getIsekaiSearchParams(period, category, novelType, limit);
    const api = new NarouNovelFetch();

    const [tenseiResult, tenniResult] = await Promise.all([new SearchBuilder({ ...searchParams, istensei: 1 }, api).execute(), new SearchBuilder({ ...searchParams, istenni: 1 }, api).execute()]);

    const combinedNovels = [...tenseiResult.values, ...tenniResult.values];
    const uniqueNovels = [...new Map(combinedNovels.map((novel) => [novel.ncode, novel])).values()];

    const pointField = periodToPointField[period];
    if (!pointField) {
        throw new InvalidParameterError(`Invalid period: ${period}`);
    }

    const items = uniqueNovels
        .toSorted((a, b) => (b[pointField] || 0) - (a[pointField] || 0))
        .map((novel, index) => ({
            title: `#${index + 1} ${novel.title}`,
            link: `https://ncode.syosetu.com/${String(novel.ncode).toLowerCase()}`,
            description: art(path.join(__dirname, 'templates/description.art'), {
                novel,
            }),
            author: novel.writer,
            category: novel.keyword.split(/[\s/\uFF0F]/).filter(Boolean),
        }));

    return {
        title: `小説家になろう - ${rankingTitle}`,
        link: rankingUrl,
        item: items.slice(0, limit) as DataItem[],
        language: 'ja',
    };
}
