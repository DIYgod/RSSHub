import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:id{.+}?',
    categories: ['finance'],
    example: '/cfmmc/main/noticeannouncement/cfmmcnotice',
    parameters: { id: '栏目 id，见下表，默认为中国期货监控公告' },
    radar: [
        {
            source: ['cfmmc.com/:id'],
            target: (params) => `/cfmmc${params.id ? `/${params.id.replace(/\/index\.shtml/, '')}` : ''}`,
        },
    ],
    name: '栏目',
    maintainers: ['nczitzk'],
    handler,
    description: `#### 党的建设

| 栏目     | id                                     |
| -------- | -------------------------------------- |
| 党建动态 | main/partybuilding/partybuildingtrends |
| 基层风采 | main/partybuilding/basestyle           |
| 学习园地 | main/partybuilding/learninggarden      |

#### 通知公告

| 栏目             | id                                  |
| ---------------- | ----------------------------------- |
| 中国期货监控公告 | main/noticeannouncement/cfmmcnotice |
| 证监会公告       | main/noticeannouncement/csrcnotice  |
| 上期所公告       | main/noticeannouncement/shfenotice  |
| 郑商所公告       | main/noticeannouncement/czcenotice  |
| 大商所公告       | main/noticeannouncement/dcenotice   |
| 中金所公告       | main/noticeannouncement/cffexnotice |
| 广期所公告       | main/noticeannouncement/gfexnotice  |

#### 焦点新闻

| 栏目     | id                               |
| -------- | -------------------------------- |
| 财经要闻 | main/focusnews/financialnews     |
| 专题聚焦 | main/focusnews/thematicfocus     |
| 金融动态 | main/focusnews/financialdynamics |

#### 保障基金

| 栏目     | id                                    |
| -------- | ------------------------------------- |
| 基金概况 | main/securityfund/fundoverview        |
| 政策法规 | main/securityfund/policiesregulations |
| 公告信息 | main/securityfund/noticeinformation   |

#### 政策法规

| 栏目                 | id                                            |
| -------------------- | --------------------------------------------- |
| 国家法律法规         | main/policiesregulations/lawsregulations      |
| 部门规章及规范性文件 | main/policiesregulations/regulationsnormative |
| 行业法规政策         | main/policiesregulations/industrypolicies     |
| 中国期货监控相关规则 | main/policiesregulations/cfmmcrules           |`,
};

async function handler(ctx) {
    const { id = 'main/noticeannouncement/cfmmcnotice' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 10;

    const rootUrl = 'http://www.cfmmc.com';
    const apiUrl = new URL('servlet/json', rootUrl).href;
    const currentUrl = new URL(id.endsWith('/') ? id : `${id}/`, rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const catalogId = $('#catalogId').prop('value');

    const { data: response } = await got.post(apiUrl, {
        form: {
            funcNo: 741000,
            catalog_id: catalogId,
            branchNo: '',
            curtPageNo: 1,
            numPerPage: limit,
            key_word: '',
            start_date: '',
            end_date: '',
        },
        headers: {
            referer: currentUrl,
        },
    });

    let items =
        response.results?.[0].data.slice(0, limit).map((item) => ({
            title: item.title,
            link: new URL(item.url, rootUrl).href,
            pubDate: timezone(parseDate(item.publish_date), 8),
        })) ?? [];

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('div.article_title h2').text();
                item.description = content('div.cont_txt').html();

                return item;
            })
        )
    );

    const author = '中国期货市场监控中心';
    const image = new URL($('a.logo img').prop('src'), rootUrl).href;

    return {
        item: items,
        title: `${author} - ${$('h3.SubPage_t3').text()}`,
        link: currentUrl,
        description: $('meta[name="Description"]').prop('content'),
        language: 'zh',
        image,
        subtitle: $('meta[name="Keywords"]').prop('content'),
        author,
        allowEmpty: true,
    };
}
