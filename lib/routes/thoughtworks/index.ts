import { Route } from '@/types';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import { parseDate } from '@/utils/parse-date';

const bearerToken = 'Bearer xxf6ea8ed2-9d54-4d48-b5e2-b4119f83dd6d'; // 固定的 token

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/thoughtworks/blog',
    parameters: { },
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
            source: ['www.thoughtworks.com/zh-cn/insights/blog'],
        },
    ],
    name: 'ThoughtWorks Inside Blog',
    maintainers: ['hyvi'],
    handler,
    description: ``,
};
async function handler() {
    const data = await ofetch(`https://platform-eu.cloud.coveo.com/rest/search/v2?organizationId=thoughtworksproductionhcqoag0q`, {
        method: 'POST',
        headers: {
            accept: '*/*',
            'accept-language': 'en,zh-CN;q=0.9,zh;q=0.8,en-US;q=0.7',
            authorization: bearerToken,
            'content-type': 'application/json',
            origin: 'https://www.thoughtworks.com',
            priority: 'u=1, i',
            referer: 'https://www.thoughtworks.com/',
            'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        },
        body: '{"locale":"zh-cn","debug":false,"tab":"default","referrer":"default","timezone":"Asia/Hong_Kong","context":{"countryLocale":"zh-cn"},"fieldsToInclude":["author","language","urihash","objecttype","collection","source","permanentid","tw_content_type","tw_topic","tw_published_date"],"pipeline":"tw-blog-pipeline","q":"","enableQuerySyntax":false,"searchHub":"tw-blog-searchHub","sortCriteria":"@tw_published_date descending","enableDidYouMean":true,"facets":[{"filterFacetCount":true,"injectionDepth":1000,"numberOfValues":100,"sortCriteria":"alphanumeric","type":"specific","currentValues":[],"freezeCurrentValues":false,"isFieldExpanded":false,"preventAutoSelect":false,"field":"tw_topic","facetId":"topic"}],"numberOfResults":10,"firstResult":0,"facetOptions":{"freezeFacetOrder":false}}',
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
        title: `ThoughtWorks Blog`,
        // 源链接
        link: `https://www.thoughtworks.com/zh-cn/insights/blog`,
        // 源文章
        item: items,
    };
}
