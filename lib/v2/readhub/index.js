const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const titles = {
    topic: '热门话题',
    news: '科技动态',
    tech: '技术资讯',
    technews: '技术资讯',
    blockchain: '区块链快讯',
    daily: '每日早报',
};

module.exports = async (ctx) => {
    let category = 'topic';
    let overview = false;
    if (titles[ctx.params.category]) {
        category = ctx.params.category;
        overview = ctx.params.overview ? true : false;
        category = category === 'tech' ? 'technews' : category;
    } else if (ctx.params.category) {
        overview = true;
    }

    const rootUrl = 'https://readhub.cn';
    const apiRootUrl = 'https://api.readhub.cn';
    const currentUrl = `${rootUrl}/topic/${category}`;
    const apiUrl = `${apiRootUrl}/${category === 'daily' ? 'topic/daily' : category}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.data.map((item) => ({
        id: item.id,
        title: item.title,
        pubDate: parseDate(item.publishDate),
        description: item.summaryAuto || item.summary || '',
        link: item.url || item.mobileUrl || `${rootUrl}/topic/${item.id}`,
        author: item.authorName || item.siteName || '',
        hasInstantView: item.hasInstantView || false,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.id + overview, async () => {
                if (item.hasInstantView || category === 'daily') {
                    const { data } = await got({
                        method: 'get',
                        url: `${apiRootUrl}/topic/instantview?topicId=${item.id}`,
                    });

                    item.description = `<a href="${data.url}">访问原网址</a><br>${!overview ? data.content : ''}`;
                }

                if (isNaN(item.id)) {
                    const { data } = await got({
                        method: 'get',
                        url: `${apiRootUrl}/topic/${item.id}`,
                    });

                    if (data.summary && overview) {
                        item.description += `${data.summary}<hr>`;
                    }

                    if (data.newsArray) {
                        item.description += '<br><b>媒体报道</b><ul>';

                        for (const news of data.newsArray) {
                            item.description +=
                                `<li><a href="${news.url || news.mobileUrl}">${news.title}</a>` +
                                (news.siteName ? `&nbsp;&nbsp;<small><b>${news.siteName}</b></small>` : '') +
                                `${news.publishDate ? `&nbsp;&nbsp;<small>${news.publishDate.split('T')[0]}</small>` : ''}</li>`;
                        }

                        item.description += '</ul>';
                    }

                    if (data.timeline && data.timeline.topics) {
                        const hasTimeline = data.timeline.commonEntities && data.timeline.commonEntities.length > 0;

                        item.description += `<br><b>${hasTimeline ? '事件追踪' : '相关事件'}</b><ul>`;

                        for (const news of data.timeline.topics) {
                            const createdAt = news.createdAt ? `<small>${news.createdAt.split('T')[0]}</small>` : '';

                            item.description += `<li>${hasTimeline ? `${createdAt}&nbsp;&nbsp;` : ''}<a href="${rootUrl}/topic/${news.id}">${news.title}</a>${hasTimeline ? '' : `&nbsp;&nbsp;${createdAt}`}</li>`;
                        }

                        item.description += '</ul>';
                    }
                }
                delete item.id;
                delete item.hasInstantView;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `Readhub - ${titles[category]}`,
        link: currentUrl,
        item: items,
    };
};
