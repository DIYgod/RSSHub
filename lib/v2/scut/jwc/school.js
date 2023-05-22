const got = require('@/utils/got');
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

const resolveRelativeUrl = (html) => html.replace(/src="\//g, `src="${url.resolve(baseUrl, '.')}`).replace(/href="\//g, `href="${url.resolve(baseUrl, '.')}`);

const apiSuccessAssert = (data) => {
    if (!data.success) {
        throw Error('article api error');
    }
};

const generateArticleLink = (id) => `<p>链接：<a href="${getArticleUrlById(id)}">电脑版</a>&nbsp;|&nbsp;<a href="${getArticleMobileUrlById(id)}">手机版</a></p>`;

const generateArticleFullText = (data) => resolveRelativeUrl(data.content) + generateArticleLink(data.id);

module.exports = async (ctx) => {
    const categoryName = ctx.params.category || 'all';
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

            const cache = await ctx.cache.get(articleUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
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

            ctx.cache.set(articleUrl, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: '华南理工大学教务处学院通知 - ' + categoryMeta.title,
        link: listPageUrl,
        item: out,
    };
};
