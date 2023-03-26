const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'all';

    const siteDomain = 'www.instructables.com';
    const apiEndpoint = `https://www.instructables.com/api_proxy/search/collections/projects/documents/search?q=*&query_by=title%2CstepBody%2CscreenName&page=1&sort_by=publishDate%3Adesc&include_fields=title%2CurlString%2CcoverImageUrl%2CscreenName%2Cfavorites%2Cviews%2CprimaryClassification%2CfeatureFlag%2CprizeLevel%2CIMadeItCount&per_page=10&filter_by=featureFlag%3A%3Dtrue`;
    const apiKey = 'NU5CdGwyRDdMVnVmM3l4cWNqQzFSVzJNZU5jaUxFU3dGK3J2L203MkVmVT02ZWFYeyJleGNsdWRlX2ZpZWxkcyI6WyJvdXRfb2YiLCJzZWFyY2hfdGltZV9tcyIsInN0ZXBCb2R5Il0sInBlcl9wYWdlIjo1MH0=';

    let pathPrefix, requestParam;
    if (category === 'all') {
        pathPrefix = '';
        requestParam = '';
    } else {
        pathPrefix = `${category}/`;
        requestParam = `+%26%26+category%3A%3D${category.charAt(0).toUpperCase()}${category.slice(1)}`;
    }

    const link = `https://${siteDomain}/${pathPrefix}projects?projects=all`;

    const response = await got({
        method: 'get',
        url: `${apiEndpoint}${requestParam}`,
        headers: {
            Referer: link,
            Host: siteDomain,
            'x-typesense-api-key': apiKey,
        },
    });

    const data = response.data;

    // console.log(data);

    ctx.state.data = {
        title: 'Instructables Projects', // 项目的标题
        link, // 指向项目的链接
        description: 'Instructables Projects', // 描述项目
        language: 'en', // 频道语言
        allowEmpty: false, // 默认 false，设为 true 可以允许 item 为空
        item: data.hits.map((item) => ({
            title: item.document.title,
            link: `https://${siteDomain}/${item.document.urlString}`,
            author: item.document.screenName,
            category: item.document.primaryClassification,
        })),
    };
};
