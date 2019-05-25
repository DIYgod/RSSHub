const axios = require('@/utils/axios');
const config = require('@/config');
// token通过process.env.YUQUE_TOKEN或者在config.js 配置
const token = config.yuque.token;

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const baseUrl = 'https://www.yuque.com';
    const repoUrl = `${baseUrl}/api/v2/repos/${id}`;
    const docsUrl = `${repoUrl}/docs`;
    const fetchData = (url) =>
        axios({
            url,
            method: 'get',
            'X-Auth-Token': token,
        });

    ctx.state.data = await Promise.all([fetchData(repoUrl), fetchData(docsUrl)]).then(async ([{ data: { data: { name: repo, user: { name }, description, namespace } } }, { data: { data: docs } }]) => {
        // 过滤掉草稿类型
        const publicDocs = docs.filter(({ status }) => status === 1);
        // 因为语雀接口有访问频率限制：
        // - 匿名请求，IP 限制, 200 次/小时
        // - 传递 Token 的情况下，每个用户（基于 Token 关联到的账户），5000 次/小时；
        // 所以没传递token的时候 避免请求每篇文档的详情 否则很容易返回状态码429
        return Promise.resolve({
            title: `${name} / ${repo}`,
            link: repoUrl,
            description,
            item: token
                ? await Promise.all(publicDocs.map((item) => fetchData(`${docsUrl}/${item.slug}`))).then((responses) =>
                      responses.map(({ data: { data: { title, body_html, created_at, slug } } }) => ({
                          title: title,
                          description: body_html,
                          pubDate: created_at,
                          link: `${baseUrl}/${namespace}/${slug}`,
                      }))
                  )
                : publicDocs.map(({ title, description, created_at, slug }) => ({
                      title,
                      description,
                      pubDate: created_at,
                      link: `${baseUrl}/${namespace}/${slug}`,
                  })),
        });
    });
};
