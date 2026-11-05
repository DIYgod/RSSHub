import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { baseUrl, getItem } from './utils';

export const route: Route = {
    path: '/magazine/:magazine/:issue?',
    categories: ['traditional-media'],
    example: '/qstheory/magazine/qs',
    parameters: {
        magazine: '刊物，`qs` 为求是，`hqwglist` 为红旗文稿',
        issue: '期数编号，如 `21` 或 `2026-21`；留空或 `latest` 获取最新一期',
    },
    radar: [
        {
            source: ['www.qstheory.cn/:magazine/mulu.htm'],
        },
    ],
    name: '在线读刊',
    maintainers: ['TonyRL', 'cscnk52', 'zhangsan-xyz'],
    handler,
};

const getYearList = ($: CheerioAPI, muluUrl: string) =>
    $('.booktitle a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, muluUrl).href,
            };
        });

const fetchIssueFromArchive = async (magazine: string, targetYear: string | undefined, targetIssueNum: number, muluUrl: string, $: CheerioAPI): Promise<string> => {
    const yearList = getYearList($, muluUrl);
    const yearEntry = targetYear ? yearList.find((y) => y.title.includes(targetYear)) : yearList[0];

    if (!yearEntry) {
        throw new InvalidParameterError(`Year ${targetYear} not found for magazine ${magazine}`);
    }

    const yearResponse = await ofetch(yearEntry.link);
    const $year = load(yearResponse);

    const issueRegex = new RegExp(`第\\s*0*${targetIssueNum}\\s*期`);
    const issueLinkEl = $year('.highlight a, #detailContent a')
        .toArray()
        .find((el) => issueRegex.test($year(el).text()) && $year(el).attr('href'));

    if (!issueLinkEl) {
        throw new InvalidParameterError(`Issue ${targetIssueNum} not found for magazine ${magazine}`);
    }

    return new URL($year(issueLinkEl).attr('href')!, yearEntry.link).href;
};

const fetchLatestIssueFromArchive = async (magazine: string, muluUrl: string, $: CheerioAPI): Promise<string> => {
    const yearList = getYearList($, muluUrl);
    const yearEntry = yearList[0];
    if (yearEntry) {
        const yearResponse = await ofetch(yearEntry.link);
        const $year = load(yearResponse);
        const lastIssue = $year('.highlight a, #detailContent a')
            .toArray()
            .map((el) => ({ text: $year(el).text(), href: $year(el).attr('href') }))
            .findLast((item) => item.text && item.href && /第\d+期/.test(item.text));
        if (lastIssue?.href) {
            return new URL(lastIssue.href, yearEntry.link).href;
        }
    }
    throw new Error(`Unable to find target issue for magazine ${magazine}`);
};

const resolveIssueUrl = async (magazine: string, issue: string | undefined, $: CheerioAPI, muluUrl: string): Promise<string> => {
    const isLatest = !issue || issue === 'latest';
    const leftBookA = $('.zxdk_left .book a');
    const latestCoverAlt = $('.zxdk_left .book img').attr('alt') ?? '';
    const coverMatch = latestCoverAlt.match(/(\d{4})年第(\d+)期/);

    if (isLatest && leftBookA.attr('href')) {
        return new URL(leftBookA.attr('href')!, muluUrl).href;
    }

    if (!isLatest) {
        const issueMatch = issue.match(/^(?:(\d{4})-)?(\d+)$/);
        if (!issueMatch) {
            throw new InvalidParameterError(`Invalid issue format: ${issue}. Expected format like "21" or "2026-21".`);
        }

        const targetYear = issueMatch[1];
        const targetIssueNum = Number(issueMatch[2]);

        if (coverMatch) {
            const coverYear = coverMatch[1];
            const coverIssueNum = Number(coverMatch[2]);
            if (targetIssueNum === coverIssueNum && (!targetYear || targetYear === coverYear)) {
                return new URL(leftBookA.attr('href')!, muluUrl).href;
            }
        }

        return await fetchIssueFromArchive(magazine, targetYear, targetIssueNum, muluUrl, $);
    }

    return await fetchLatestIssueFromArchive(magazine, muluUrl, $);
};

async function handler(ctx) {
    const { magazine, issue } = ctx.req.param();
    const isLatest = !issue || issue === 'latest';
    const muluUrl = `${baseUrl}/${magazine}/mulu.htm`;
    const muluResponse = await ofetch(muluUrl);
    const $ = load(muluResponse);

    const targetIssueUrl = await resolveIssueUrl(magazine, issue, $, muluUrl);

    const issueResponse = await ofetch(targetIssueUrl);
    const $$ = load(issueResponse);

    const seen = new Set<string>();
    const list = $$('.highlight a[href$="/c.html"], .highlight a[href*="/c_"]')
        .toArray()
        .map((item) => {
            const $item = $$(item);
            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, targetIssueUrl).href,
            };
        })
        .filter((item) => {
            if (!item.title || !/\S/.test(item.title) || seen.has(item.link)) {
                return false;
            }
            seen.add(item.link);
            return true;
        });

    // The category route caches the same articles under their link with list titles
    const items = await pMap(list, (item) => cache.tryGet(`qstheory:magazine:${item.link}`, () => getItem(item, true)), { concurrency: 3 });

    const title = isLatest ? $('head title').text() : $$('h1').text() || $$('head title').text();
    const issueCover = $$('.highlight img').first().attr('src');
    const muluCover = $('.zxdk_left .book img').attr('src');
    const image = issueCover ? new URL(issueCover, targetIssueUrl).href : muluCover ? new URL(muluCover, muluUrl).href : undefined;

    return {
        title,
        link: isLatest ? muluUrl : targetIssueUrl,
        image,
        item: items as DataItem[],
    };
}
