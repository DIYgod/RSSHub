import { constants, publicEncrypt } from 'node:crypto';

import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const searchCode = '17da70961a7';
const dataTypeId = '107';
const searchPageUrl = 'https://sousuo.www.gov.cn/sousuo/search.shtml';
const searchApiUrl = 'https://sousuoht.www.gov.cn/athena/forward/2B22E8E39E850E17F95A016A74FCB6B673336FA8B6FEC0E2955907EF9AEE06BE';

// These values are embedded in the public search page's JavaScript and are not private credentials.
const athenaAppCredential = 'a46884b2013e4d189f2a8e2d49a23525';
const athenaPublicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCSMhMJQ+XLI7oW0k9Bwufur4Ag40tcsrzT7WZf6Ao0O/hyY1gZtCSYFxkxIZUXjW46j27XSW8IDX1rTJoHaMxHCWsOpTi2W5stybGYZytsY5on8gd8AIaS1d52h9eaS2TFydtJJtE50xHmT0WmoyoinWCuVCOkdCLhh9b9jSdeSQIDAQAB
-----END PUBLIC KEY-----`;

const splitWords = (value: string | null) => value?.split(/\s+/).filter(Boolean) ?? [];

const getMonthBoundary = (yearValue: string | null, monthValue: string | null, end: boolean) => {
    const year = Number(yearValue);
    const month = monthValue ? Number(monthValue) : end ? 12 : 1;

    if (!year || !month || month < 1 || month > 12) {
        return '';
    }

    return end ? timezone(new Date(year, month, 1), 8).getTime() - 1 : timezone(new Date(year, month - 1, 1), 8).getTime();
};

const buildSearchRequest = (advance?: string) => {
    const params = new URLSearchParams(advance);
    const searchField = params.get('search_field') ?? params.get('searchfield');
    const beginDateTime = getMonthBoundary(params.get('pubmintimeYear'), params.get('pubmintimeMonth'), false);
    const endDateTime = getMonthBoundary(params.get('pubmaxtimeYear'), params.get('pubmaxtimeMonth'), true);
    const isAdvancedSearch = Boolean(advance);

    return {
        code: searchCode,
        historySearchWords: [],
        dataTypeId,
        orderBy: 'time',
        searchBy: searchField === 'title' ? 'title' : 'all',
        appendixType: '',
        granularity: beginDateTime || endDateTime ? 'CUSTOM' : 'ALL',
        trackTotalHits: true,
        beginDateTime,
        endDateTime,
        isSearchForced: 0,
        filters: [],
        pageNo: 1,
        pageSize: 20,
        ...(isAdvancedSearch
            ? {
                  isDefaultAdvanced: 1,
                  advancedFilters: [
                      {
                          fieldId: '',
                          fieldName: 'containsAll',
                          searchWord: [...splitWords(params.get('allpro')), ...(params.get('inpro') ? [params.get('inpro')] : [])],
                      },
                      {
                          fieldId: '',
                          fieldName: 'containsOne',
                          searchWord: splitWords(params.get('orpro')),
                      },
                      {
                          fieldId: '',
                          fieldName: 'none',
                          searchWord: splitWords(params.get('notpro')),
                      },
                  ],
                  customFilter: {
                      operator: 'and',
                      properties: [],
                  },
                  isAdvancedSearch: 1,
              }
            : {
                  allData: true,
                  customFilter: {
                      operator: 'and',
                      properties: [],
                  },
              }),
    };
};

const buildSearchLink = (request: ReturnType<typeof buildSearchRequest>) => {
    const url = new URL(searchPageUrl);
    const fields = ['code', 'dataTypeId', 'orderBy', 'searchBy', 'granularity', 'beginDateTime', 'endDateTime', 'allData', 'isDefaultAdvanced', 'advancedFilters'] as const;

    for (const field of fields) {
        const value = request[field];
        if (value !== undefined && value !== '') {
            url.searchParams.set(field, field === 'advancedFilters' ? JSON.stringify(value) : String(value));
        }
    }

    return url.href;
};

const normalizeSearchItem = (item): DataItem => {
    const title = load((item.title_no_tag || item.title || '').replaceAll(/<br\s*\/?>/gi, ' '))
        .text()
        .replaceAll(/\s+/g, ' ');

    return {
        title,
        link: item.url,
        description: item.summary || item.content,
        ...(item.time && {
            pubDate: timezone(parseDate(item.time, 'YYYY-MM-DD HH:mm:ss'), 8),
        }),
    };
};

const getAthenaAppKey = () =>
    encodeURIComponent(
        publicEncrypt(
            {
                key: athenaPublicKey,
                padding: constants.RSA_PKCS1_PADDING,
            },
            Buffer.from(athenaAppCredential)
        ).toString('base64')
    );

export const route: Route = {
    path: '/govall/:advance?',
    categories: ['government'],
    example: '/gov/zhengce/govall/orpro=555&notpro=2&search_field=title',
    parameters: { advance: '高级搜索选项，将作为请求参数直接添加到url后。目前已知的选项及其意义如下。' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.gov.cn/'],
            target: '/govall',
        },
    ],
    name: '信息稿件',
    maintainers: ['ciaranchen'],
    handler,
    url: 'www.gov.cn/',
    description: `|               选项              |                       意义                       |                    备注                    |
| :-----------------------------: | :----------------------------------------------: | :----------------------------------------: |
|              orpro              |             包含以下任意一个关键词。             |                用空格分隔。                |
|              allpro             |                包含以下全部关键词                |                                            |
|              notpro             |                 不包含以下关键词                 |                                            |
|              inpro              |                完整不拆分的关键词                |                                            |
|           searchfield           | title: 搜索词在标题中；content: 搜索词在正文中。 | 上游已不支持仅正文，content 将搜索全部位置 |
| pubmintimeYear, pubmintimeMonth |                    从某年某月                    |       单独使用月份参数无法只筛选月份       |
| pubmaxtimeYear, pubmaxtimeMonth |                    到某年某月                    |       单独使用月份参数无法只筛选月份       |
|              colid              |                       栏目                       |            上游新接口已不再支持            |`,
};

async function handler(ctx) {
    const advance = ctx.req.param('advance');
    const request = buildSearchRequest(advance);
    const link = buildSearchLink(request);
    const { data: response } = await got.post(searchApiUrl, {
        headers: {
            athenaAppKey: getAthenaAppKey(),
            athenaAppName: encodeURIComponent('国网搜索'),
        },
        json: request,
    });

    if (response?.resultCode?.code !== 200 || !Array.isArray(response?.result?.data?.middle?.list)) {
        throw new Error(`中国政府网搜索接口请求失败，错误代码：${response?.resultCode?.code ?? '未知'}`);
    }

    const list = response.result.data.middle.list.filter((item) => item.url).map((item) => normalizeSearchItem(item));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                let description = item.description;
                try {
                    const contentData = await got(item.link);
                    const content = load(contentData.data);
                    description = content('#UCAP-CONTENT, div.TRS_UEDITOR').first().html() || description;
                } catch {
                    // Keep the API summary when the article page is unavailable.
                }

                return {
                    ...item,
                    description,
                };
            })
        )
    );

    return {
        title: '信息稿件 - 中国政府网',
        link,
        item: items,
    };
}
