const got = require('@/utils/got');

const baseUrl = 'https://bugs.chromium.org/prpc/monorail.Issues/ListIssues';

module.exports = async (ctx) => {
    const csrfresponse = await got.get('https://bugs.chromium.org/p/project-zero/issues/list?can=1&q=&sort=-id&colspec=ID%20Status%20Restrict%20Reported%20Vendor%20Product%20Finder%20Summary');
    const token = csrfresponse.data.match(/(?<='token': ')[^'\s]+(?=')/g)[0];

    const formdata = `{"query":"","cannedQuery":1,"projectNames":["project-zero"],"pagination":{"maxItems":50,"start":0},"sortSpec":"-id"}`;
    const title = `project-zero issues`;
    const link = `https://bugs.chromium.org/p/project-zero/issues/list?can=1&q=&sort=-id&colspec=ID%20Status%20Restrict%20Reported%20Vendor%20Product%20Finder%20Summary`;

    // curl 'https://bugs.chromium.org/prpc/monorail.Issues/ListIssues' -X POST -H 'accept: application/json' -H 'x-xsrf-token: 1111'  -H 'content-type: application/json'  --data '{"query":"","cannedQuery":1,"projectNames":["project-zero"],"pagination":{"maxItems":1,"start":100},"sortSpec":"-id"}'

    const response = await got({
        method: 'post',
        url: baseUrl,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'x-xsrf-token': token,
        },
        data: formdata,
    });

    const data = JSON.parse(response.data.substr(")]}'".length)).issues;

    ctx.state.data = {
        // 源标题
        title: title,
        // 源链接
        link: link,
        // 源说明
        description: title,
        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 文章标题
            title: `[${item.statusRef.status}] ${item.summary}`,
            // 文章正文
            description: item.summary,
            // 文章发布时间
            pubDate: new Date(item.openedTimestamp * 1000).toUTCString(),
            // 文章链接
            link: `https://bugs.chromium.org/p/project-zero/issues/detail?id=${item.localId}`,
            author: item.ownerRef.displayName,
        })),
    };
};
