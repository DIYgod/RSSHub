const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'all';

    const siteDomain = 'www.instructables.com';
    const apiKey = 'NU5CdGwyRDdMVnVmM3l4cWNqQzFSVzJNZU5jaUxFU3dGK3J2L203MkVmVT02ZWFYeyJleGNsdWRlX2ZpZWxkcyI6WyJvdXRfb2YiLCJzZWFyY2hfdGltZV9tcyIsInN0ZXBCb2R5Il0sInBlcl9wYWdlIjo1MH0=';

    let pathPrefix, projectFilter;
    if (category === 'all') {
        pathPrefix = '';
        projectFilter = '';
    } else {
        pathPrefix = `${category}/`;
        const filterValue = `${category.charAt(0).toUpperCase()}${category.slice(1)}`;
        projectFilter = category !== 'teachers' ? ` && category:=${filterValue}` : `&& teachers:=${filterValue}`;
    }

    const link = `https://${siteDomain}/${pathPrefix}projects?projects=all`;

    const response = await got({
        method: 'get',
        url: `https://${siteDomain}/api_proxy/search/collections/projects/documents/search`,
        headers: {
            Referer: link,
            Host: siteDomain,
            'x-typesense-api-key': apiKey,
        },
        searchParams: {
            q: '*',
            query_by: 'title,stepBody,screenName',
            page: 1,
            per_page: 50,
            sort_by: 'publishDate:desc',
            include_fields: 'title,urlString,coverImageUrl,screenName,publishDate,favorites,views,primaryClassification,featureFlag,prizeLevel,IMadeItCount',
            filter_by: `featureFlag:=true${projectFilter}`,
        },
    });

    const data = response.data;

    ctx.state.data = {
        title: 'Instructables Projects', // 项目的标题
        link, // 指向项目的链接
        description: 'Instructables Projects', // 描述项目
        language: 'en', // 频道语言
        item: data.hits.map((item) => ({
            title: item.document.title,
            link: `https://${siteDomain}/${item.document.urlString}`,
            author: item.document.screenName,
            description: `<img src="${item.document.coverImageUrl}">`,
            pubDate: new Date(item.document.publishDate).toUTCString(),
            category: item.document.primaryClassification,
        })),
    };
};
