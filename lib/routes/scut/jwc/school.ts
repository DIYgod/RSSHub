import querystring from 'node:querystring';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const baseUrl = 'http://jw.scut.edu.cn';
const refererUrl = baseUrl + '/dist/';

const listPageUrl = baseUrl + '/zhinan/cms/toPosts.do?category=1';
const listApiUrl = baseUrl + '/zhinan/jw/api/v2/findInformNotice.do';
const articleApiUrl = baseUrl + '/zhinan/jw/api/v2/getArticleInfo.do';

const getArticleUrlById = (id) => `${baseUrl}/zhinan/cms/article/view.do?type=posts&id=${id}`;
const getArticleMobileUrlById = (id) => `${baseUrl}/dist/#/detail/index?id=${id}&type=notice`;

const categoryMap = {
    all: { title: '全部', tag: '0' },
    course: { title: '选课', tag: '1' },
    exam: { title: '考试', tag: '2' },
    info: { title: '信息', tag: '6' },
};

const convertTimezoneToCST = (date) => {
    const timeZone = 8;
    const serverOffset = date.getTimezoneOffset() / 60;

    return new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset));
};

const generateArticlePubDate = (createDateStr) => {
    const date = new Date(createDateStr);
    date.setHours(8);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return convertTimezoneToCST(date);
};

const isRedirectPage = (data) => !!data.link;

const resolveRelativeUrl = (html) => html.replaceAll('src="/', `src="${new URL('.', baseUrl).href}`).replaceAll('href="/', `href="${new URL('.', baseUrl).href}`);

const apiSuccessAssert = (data) => {
    if (!data.success) {
        throw new Error('article api error');
    }
};

const generateArticleLink = (id) => `<p>链接：<a href="${getArticleUrlById(id)}">电脑版</a>&nbsp;|&nbsp;<a href="${getArticleMobileUrlById(id)}">手机版</a></p>`;

const generateArticleFullText = (data) => resolveRelativeUrl(data.content) + generateArticleLink(data.id);

export const route: Route = {
    path: '/jwc/school/:category?',
    categories: ['university'],
    example: '/scut/jwc/school/all',
    parameters: { category: '通知分类，默认为 `all`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处学院通知',
    maintainers: ['imkero', 'Rongronggg9'],
    handler,
    description: `| 全部 | 选课   | 考试 | 信息 |
| ---- | ------ | ---- | ---- |
| all  | course | exam | info |`,
};

async function handler(ctx) {
    const categoryName = ctx.req.param('category') || 'all';
    const categoryMeta = categoryMap[categoryName];

    const qs = querystring.stringify({
        category: 1,
        pageNo: 1,
        pageSize: 20,
        tag: categoryMeta.tag,
    });

    const listApiResponse = await got({
        method: 'post',
        url: `${listApiUrl}?${qs}`,
        headers: {
            Referer: refererUrl,
        },
    });
    apiSuccessAssert(listApiResponse.data);

    const articleMetaArray = listApiResponse.data.data.list;
    const out = await Promise.all(
        articleMetaArray.map(async (articleMeta) => {
            const articleUrl = getArticleUrlById(articleMeta.id);

            const cacheIn = await cache.get(articleUrl);
            if (cacheIn) {
                return JSON.parse(cacheIn);
            }

            const qs = querystring.stringify({
                id: articleMeta.id,
                categoryType: '',
            });
            const articleApiResponse = await got({
                method: 'post',
                url: `${articleApiUrl}?${qs}`,
                headers: {
                    Referer: refererUrl,
                },
            });
            apiSuccessAssert(articleApiResponse.data);

            const articleData = articleApiResponse.data.data;
            articleData.id = articleMeta.id;

            let articleFullText = null;
            if (!isRedirectPage(articleData)) {
                articleFullText = generateArticleFullText(articleData);
            }

            const item = {
                title: articleData.name,
                link: articleUrl,
                description: articleFullText,
                pubDate: generateArticlePubDate(articleData.createDate).toUTCString(),
            };

            cache.set(articleUrl, JSON.stringify(item));
            return item;
        })
    );

    return {
        title: '华南理工大学教务处学院通知 - ' + categoryMeta.title,
        link: listPageUrl,
        item: out,
    };
}
