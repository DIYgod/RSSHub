const got = require('@/utils/got');

function desc(item, option) {
    if (option === 'brief') {
        return `<p>#${item.group_name} (${item.created_at})<br><a href="http://cablenews.i-cable.com/ci/news/article/37/${item.id}">閱讀全文</a></p>`;
    } else if (option === 'withphoto') {
        return `<img src="${item.pic_url}"><p>${item.desc}</p>`;
    } else if (option === 'plain') {
        return item.desc;
    } else {
        return '暂不支持此类型，请到 https://github.com/DIYgod/RSSHub/issues 反馈';
    }
}

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
    let feedTitle;
    if (category === 'all') {
        result = data;
        feedTitle = 'i-CABLE 即時新聞';
    } else if (category === 'local') {
        result = data.filter((w) => w.group_id === '4');
        feedTitle = '本地 - i-CABLE 即時新聞';
    } else if (category === 'international') {
        result = data.filter((w) => w.group_id === '5');
        feedTitle = '國際 - i-CABLE 即時新聞';
    } else if (category === 'finance') {
        result = data.filter((w) => w.group_id === '6');
        feedTitle = '財經 - i-CABLE 即時新聞';
    } else if (category === 'china') {
        result = data.filter((w) => w.group_id === '7');
        feedTitle = '兩岸 - i-CABLE 即時新聞';
    } else if (category === 'sports') {
        result = data.filter((w) => w.group_id === '8');
        feedTitle = '體育 - i-CABLE 即時新聞';
    } else {
        result = [{ desc: '暂不支持此类型，请到 https://github.com/DIYgod/RSSHub/issues 反馈' }];
    }

    const items = result.map((item) => ({
        title: item.title, // 文章标题
        author: '有線新聞', // 文章作者
        description: desc(item, option),
        pubDate: `${item.created_at} +0800`, // 文章发布时间
        guid: item.id, // 文章唯一标示, 必须唯一, 可选, 默认为文章链接
        link: `http://cablenews.i-cable.com/ci/news/article/37/${item.id}`, // 指向文章的链接
    }));

    ctx.state.data = {
        title: feedTitle, // feedTitle
        link: 'http://cablenews.i-cable.com/ci/news/listing', // feedURL
        description: '有線新聞 - 走在事實最前線', // feedDesc
        item: items,
    };
};
