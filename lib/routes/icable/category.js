const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const option = ctx.params.option || 'withphoto';

    const response = await got({
        method: 'get',
        url: `http://cablenews.i-cable.com/ci/news/listing/api`,
        headers: {
            Referer: `http://cablenews.i-cable.com/ci/news/listing`,
        },
    });

    const data = response.data;
    let result;
    if (category === 'all') {
        result = data;
    } else if (category === 'local') {
        result = data.filter((w) => w.group_id === '4');
    } else if (category === 'international') {
        result = data.filter((w) => w.group_id === '5');
    } else if (category === 'finance') {
        result = data.filter((w) => w.group_id === '6');
    } else if (category === 'china') {
        result = data.filter((w) => w.group_id === '7');
    } else if (category === 'sports') {
        result = data.filter((w) => w.group_id === '8');
    } else {
        result = [{ desc: '暂不支持此类型，请到 https://github.com/DIYgod/RSSHub/issues 反馈' }];
    }

    let items;
    if (option === 'alloption') {
        items = result.map((item) => ({
            title: item.title, // 文章标题
            author: '有線新聞', // 文章作者
            description: `<img src="${item.pic_url}"><p>${item.desc}</p><p>在 web 打開: <a href="http://cablenews.i-cable.com/ci/videopage/news/${item.id}">http://cablenews.i-cable.com/ci/videopage/news/${item.id}</a></p><p>在 app 打開: <a href="https://ott-news.i-cable.com/zh-hk/l/open-content?cid=${item.id}&ct=1">https://ott-news.i-cable.com/zh-hk/l/open-content?cid=${item.id}&ct=1</a></p>`, // 文章摘要或全文
            pubDate: item.created_at, // 文章发布时间
            guid: item.id, // 文章唯一标示, 必须唯一, 可选, 默认为文章链接
            link: `http://cablenews.i-cable.com/ci/videopage/news/${item.id}`, // 指向文章的链接
        }))
    } else if (option === 'withlink') {
        items = result.map((item) => ({
            title: item.title, // 文章标题
            author: '有線新聞', // 文章作者
            description: `<p>${item.desc}</p><p>在 web 打開: <a href="http://cablenews.i-cable.com/ci/videopage/news/${item.id}">http://cablenews.i-cable.com/ci/videopage/news/${item.id}</a></p><p>在 app 打開: <a href="https://ott-news.i-cable.com/zh-hk/l/open-content?cid=${item.id}&ct=1">https://ott-news.i-cable.com/zh-hk/l/open-content?cid=${item.id}&ct=1</a></p>`, // 文章摘要或全文
            pubDate: item.created_at, // 文章发布时间
            guid: item.id, // 文章唯一标示, 必须唯一, 可选, 默认为文章链接
            link: `http://cablenews.i-cable.com/ci/videopage/news/${item.id}`, // 指向文章的链接
        }))
    } else if (option === 'withphoto') {
        items = result.map((item) => ({
            title: item.title, // 文章标题
            author: '有線新聞', // 文章作者
            description: `<img src="${item.pic_url}"><p>${item.desc}</p>`, // 文章摘要或全文
            pubDate: item.created_at, // 文章发布时间
            guid: item.id, // 文章唯一标示, 必须唯一, 可选, 默认为文章链接
            link: `http://cablenews.i-cable.com/ci/videopage/news/${item.id}`, // 指向文章的链接
        }))
    } else if (option === 'nooption') {
        items = result.map((item) => ({
            title: item.title, // 文章标题
            author: '有線新聞', // 文章作者
            description: item.desc, // 文章摘要或全文
            pubDate: item.created_at, // 文章发布时间
            guid: item.id, // 文章唯一标示, 必须唯一, 可选, 默认为文章链接
            link: `http://cablenews.i-cable.com/ci/videopage/news/${item.id}`, // 指向文章的链接
        }))
    } else {
        items = [{ desc: '暂不支持此类型，请到 https://github.com/DIYgod/RSSHub/issues 反馈' }];
    }

    ctx.state.data = {
        title: 'i-CABLE 即時新聞', // feedTitle
        link: 'http://cablenews.i-cable.com/ci/news/listing', // feedURL
        description: '有線新聞 - 走在事實最前線', // feedDesc
        item: items,
    };
};
