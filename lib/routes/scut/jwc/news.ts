import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import * as url from 'node:url';
import querystring from 'node:querystring';

const baseUrl = 'http://jw.scut.edu.cn';
const refererUrl = baseUrl + '/dist/';

const listPageUrl = baseUrl + '/zhinan/cms/toNews.do';
const listApiUrl = baseUrl + '/zhinan/jw/api/v2/findNewsTrends.do';
const articleApiUrl = baseUrl + '/zhinan/jw/api/v2/getArticleInfo.do';

const getArticleUrlById = (id) => `${baseUrl}/zhinan/cms/article/view.do?type=posts&id=${id}`;
const getArticleMobileUrlById = (id) => `${baseUrl}/dist/#/detail/index?id=${id}&type=news`;

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

const resolveRelativeUrl = (html) => html.replaceAll('src="/', `src="${url.resolve(baseUrl, '.')}`).replaceAll('href="/', `href="${url.resolve(baseUrl, '.')}`);

const apiSuccessAssert = (data) => {
    if (!data.success) {
        throw new Error('article api error');
    }
};

const generateBannerImgHtml = (bannerImageUrl) => (bannerImageUrl ? `<p><img src="${bannerImageUrl}"></p>` : '');

const generateArticleLink = (id) => `<p>链接：<a href="${getArticleUrlById(id)}">电脑版</a>&nbsp;|&nbsp;<a href="${getArticleMobileUrlById(id)}">手机版</a></p>`;

const generateArticleFullText = (data) => generateBannerImgHtml(data.bannerUrl) + resolveRelativeUrl(data.content) + generateArticleLink(data.id);

export const route: Route = {
    path: '/jwc/news',
    categories: ['university'],
    example: '/scut/jwc/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处新闻动态',
    maintainers: ['imkero'],
    handler,
};

async function handler() {
    const qs = querystring.stringify({
        pageNo: 1,
        pageSize: 20,
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
        title: '华南理工大学教务处新闻动态',
        link: listPageUrl,
        item: out,
    };
}
