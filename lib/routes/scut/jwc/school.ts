// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const url = require('url');
const querystring = require('querystring');

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

const resolveRelativeUrl = (html) => html.replaceAll('src="/', `src="${url.resolve(baseUrl, '.')}`).replaceAll('href="/', `href="${url.resolve(baseUrl, '.')}`);

const apiSuccessAssert = (data) => {
    if (!data.success) {
        throw new Error('article api error');
    }
};

const generateArticleLink = (id) => `<p>链接：<a href="${getArticleUrlById(id)}">电脑版</a>&nbsp;|&nbsp;<a href="${getArticleMobileUrlById(id)}">手机版</a></p>`;

const generateArticleFullText = (data) => resolveRelativeUrl(data.content) + generateArticleLink(data.id);

export default async (ctx) => {
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

    ctx.set('data', {
        title: '华南理工大学教务处学院通知 - ' + categoryMeta.title,
        link: listPageUrl,
        item: out,
    });
};
