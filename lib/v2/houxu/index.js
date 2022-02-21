const got = require('@/utils/got');
const path = require('path');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');

const categories = {
    index: '首页',
    featured: '热点',
    updated: '跟踪',
    memory: '跟踪',
    events: '事件',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'index';
    const id = ctx.params.id ?? '';
    let title,
        description,
        author = '';

    const rootUrl = 'https://houxu.app';
    const currentUrl = `${rootUrl}/api/1/${id ? `lives/${id}/threads` : category === 'events' ? category : category === 'updated' || category === 'memory' ? 'lives/updated' : `records/${category}`}/?limit=${ctx.query.limit ?? 30}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let items = response.data.results.map((item) => ({
        guid: item.object?.id ?? item.id,
        title: item.link?.title ?? item.object?.title ?? item.title,
        link: item.link?.url ?? `${rootUrl}/lives/${item.object?.id ?? item.id}`,
        pubDate: parseDate(item.create_at ?? item.object?.create_at ?? item.publish_at),
        description: `<p>${item.link?.description ?? item.object?.summary ?? item.last?.link.description ?? item.description}</p>`,
        author: item.link?.source ?? item.link?.media?.name ?? item.object?.creator?.username ?? item.object?.creator?.name ?? item.creator?.username ?? item.creator?.name ?? '',
    }));

    if (id) {
        const detailResponse = await got({
            method: 'get',
            url: `${rootUrl}/api/1/lives/${id}`,
        });

        title = detailResponse.data.title;
        description = detailResponse.data.summary;
        author = detailResponse.data.creator.name;
    } else {
        items = await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.guid, async () => {
                    try {
                        const detailResponse = await got({
                            method: 'get',
                            url: `${rootUrl}/api/1/lives/${item.guid}/threads/?limit=1000`,
                        });

                        const feeds = detailResponse.data.results.map((item) =>
                            art(path.join(__dirname, 'templates/description.art'), {
                                title: item.link.title,
                                link: item.link.url,
                                pubDate: parseDate(item.create_at),
                                description: `<p>${item.link.description}</p>`,
                                author: item.link.source ?? item.link.media?.name ?? '',
                            })
                        );

                        item.description = feeds.join('');

                        return item;
                    } catch (e) {
                        return Promise.resolve('');
                    }
                })
            )
        );
    }

    ctx.state.data = {
        title: `${title || categories[category]} - 后续`,
        link: currentUrl,
        item: items,
        description,
        author,
    };
};
