const got = require('@/utils/got');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    let title;
    let link;
    let path = category;
    switch (category) {
        case 'topic':
            title = '热门话题';
            link = 'https://readhub.cn/topics';
            break;
        case 'news':
            title = '科技动态';
            link = 'https://readhub.cn/news';
            break;
        case 'technews':
            title = '开发者资讯';
            link = 'https://readhub.cn/tech';
            break;
        case 'blockchain':
            title = '区块链快讯';
            link = 'https://readhub.cn/blockchain';
            break;
        case 'daily':
            title = '每日早报';
            link = 'https://readhub.cn/daily';
            break;
        default:
            break;
    }

    if (path === 'daily') {
        path = 'topic/daily';
    }

    const {
        data: { data },
    } = await got({
        method: 'get',
        url: `https://api.readhub.cn/${path}`,
    });

    const out = await Promise.all(
        data.map(async (news) => {
            const id = news.id;
            let item;
            if (category === 'topic' || category === 'daily') {
                const link = `https://readhub.cn/topic/${id}`;
                const cache = await ctx.cache.get(link);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }
                const { data } = await got.get(`https://api.readhub.cn/topic/${id}`);
                let description = data.summary;
                if (data.newsArray) {
                    description += '<br/><br/>媒体报道：';
                    for (const one of data.newsArray) {
                        description += `<br/>${dayjs(new Date(one.publishDate)).format('YY-MM-DD')} ${one.siteName}: <a href='${one.mobileUrl || one.url}'>${one.title}</a>`;
                    }
                }
                if (data.timeline && data.timeline.topics) {
                    let type = '相关事件';
                    if (data.timeline.commonEntities && data.timeline.commonEntities.length > 0) {
                        type = '事件追踪';
                    }
                    description += `<br/><br/>${type}：`;
                    for (const one of data.timeline.topics) {
                        description += `<br/>${dayjs(new Date(one.createdAt)).format('YY-MM-DD')} <a href='https://readhub.cn/topic/${one.id}'>${one.title.trim()}</a>`;
                    }
                }
                item = {
                    title: data.title,
                    description: description.replace(new RegExp('\n', 'g'), '<br/>'),
                    pubDate: data.publishDate,
                    guid: id,
                    link,
                };

                ctx.cache.set(link, JSON.stringify(item));
            } else {
                const description = news.summaryAuto || news.summary || news.title;
                item = {
                    title: news.title,
                    description: description.replace(new RegExp('\n', 'g'), '<br/>'),
                    pubDate: news.publishDate,
                    guid: id,
                    link: news.url || news.mobileUrl,
                };
            }
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `Readhub - ${title}`,
        link,
        item: out,
    };
};
