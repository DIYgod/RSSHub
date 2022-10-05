const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const sorts = {
    hot: '热门',
    last: '最近',
};

module.exports = async (ctx) => {
    const sort = ctx.params.sort ?? 'hot';
    const id = ctx.params.id ?? '';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;

    const rootUrl = 'https://hellogithub.com';
    const apiRootUrl = 'https://api.hellogithub.com';
    const currentUrl = `${rootUrl}/?sort_by=${sort}${id ? `&tid=${id}` : ''}`;
    const apiUrl = `${apiRootUrl}/v1/?sort_by=${sort}${id ? `&tid=${id}` : ''}&page=1`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let buildId, tag;
    if (id) {
        const tagUrl = `${rootUrl}/tags/${id}`;

        const tagResponse = await got({
            method: 'get',
            url: tagUrl,
        });

        const $ = cheerio.load(tagResponse.data);

        tag = $('meta[property="og:title"]').attr('content').split(' ').pop();
        buildId = tagResponse.data.match(/"buildId":"(.*?)",/)[1];
    }

    if (!buildId) {
        const buildResponse = await got({
            method: 'get',
            url: rootUrl,
        });

        buildId = buildResponse.data.match(/"buildId":"(.*?)",/)[1];
    }

    let items = response.data.data.slice(0, limit).map((item) => ({
        guid: item.item_id,
        title: item.title,
        author: item.author,
        link: `${rootUrl}/repository/${item.item_id}`,
        description: item.description,
        pubDate: parseDate(item.updated_at),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailUrl = `${rootUrl}/_next/data/${buildId}/repository/${item.guid}.json`;

                const detailResponse = await got({
                    method: 'get',
                    url: detailUrl,
                });

                const data = detailResponse.data.pageProps.repo;

                item.title = `${data.name}: ${data.title}`;
                item.category = [`No.${data.volume_name}`, ...data.tags.map((t) => t.name)];
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    name: data.full_name,
                    description: data.description,
                    summary: data.summary,
                    image: data.image_url,
                    stars: data.stars ?? data.stars_str,
                    isChinese: data.has_chinese,
                    language: data.primary_lang,
                    isActive: data.is_active,
                    license: data.license,
                    isOrganization: data.is_org,
                    forks: data.forks,
                    openIssues: data.open_issues,
                    subscribers: data.subscribers,
                    homepage: data.homepage,
                    url: data.url,
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `HelloGithub - ${sorts[sort]}${tag || ''}项目`,
        link: currentUrl,
        item: items,
    };
};
