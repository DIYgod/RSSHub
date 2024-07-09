import { Route } from '@/types';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/thoughtworks/blog',
    radar: [
        {
            source: ['www.thoughtworks.com/zh-cn/insights/blog'],
        },
    ],
    name: 'Inside Blog',
    maintainers: ['Hyvi'],
    handler,
};
async function handler() {
    // https://www.thoughtworks.com/rest/search/config 里的 BLOG_SEARCH_TOKEN
    const tokenData = await ofetch('https://www.thoughtworks.com/rest/search/config', {
        headers: {
            'content-type': 'application/json',
            origin: 'https://www.thoughtworks.com',
            referer: 'https://www.thoughtworks.com/',
        },
    });

    // 'Bearer ' + token
    const bearerToken = 'Bearer ' + tokenData.BLOG_SEARCH_TOKEN;

    const data = await ofetch('https://platform-eu.cloud.coveo.com/rest/search/v2?organizationId=thoughtworksproductionhcqoag0q', {
        method: 'POST',
        headers: {
            authorization: bearerToken,
            'content-type': 'application/json',
            origin: 'https://www.thoughtworks.com',
            referer: 'https://www.thoughtworks.com/',
        },
        body: {
            context: { countryLocale: 'zh-cn' },
            fieldsToInclude: ['author', 'language', 'objecttype', 'collection', 'source', 'tw_content_type', 'tw_topic', 'tw_published_date'],
            sortCriteria: '@tw_published_date descending',
            numberOfResults: 10,
            firstResult: 0,
        },
    });
    // 从 API 响应中提取相关数据
    const items = data.results.map((item) => ({
        // 文章标题
        title: item.title,
        // 文章链接
        link: item.uri,
        // 文章正文
        description: item.excerpt,
        // 文章发布日期
        pubDate: parseDate(item.raw.tw_published_date),
        // 如果有的话，文章作者
        author: item.raw.sysauthor,
        // 如果有的话，文章分类
        // category: item.labels.map((label) => label.name),
    }));

    return {
        // 源标题
        title: 'ThoughtWorks Blog',
        // 源链接
        link: 'https://www.thoughtworks.com/zh-cn/insights/blog',
        // 源文章
        item: items,
    };
}
