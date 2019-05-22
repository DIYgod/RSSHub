const axios = require('@/utils/axios');
const config = require('@/config');

module.exports = async (ctx) => {
    const { repo_id } = ctx.params;
    const baseUrl = 'https://www.yuque.com';
    const repoUrl = `${baseUrl}/api/v2/repos/${repo_id}`;
    const docsUrl = `${repoUrl}/docs`;
    const headers = {};
    if (config.yuque.token) {
        headers['X-Auth-Token'] = config.yuque.token;
    }
    const fetchData = (url) =>
        axios({
            url,
            method: 'get',
            headers,
        });

    const repoDetail = await fetchData(repoUrl);
    const {
        name: repo,
        user: { name },
        description,
    } = repoDetail.data.data;
    const docsDetail = await fetchData(docsUrl);
    const docs = docsDetail.data.data;

    // 过滤掉草稿类型
    const publicDocs = docs.filter(({ status }) => status === 1);
    ctx.state.data = {
        title: `${name} / ${repo}`,
        link: repoUrl,
        description,
        item: await Promise.all(
            publicDocs.map(async (doc) => {
                const item = {
                    title: doc.title,
                    description: doc.description,
                    pubDate: doc.created_at,
                    link: `${baseUrl}/${repo_id}/${doc.id}`,
                };
                const key = `yuque${doc.id}`;
                const value = await ctx.cache.get(key);

                if (value) {
                    item.description = value;
                } else {
                    const docDetail = await fetchData(`${docsUrl}/${doc.id}`);
                    const { body_html } = docDetail.data.data;
                    item.description = body_html;
                    ctx.cache.set(key, item.description);
                }
                return Promise.resolve(item);
            })
        ),
    };
};
