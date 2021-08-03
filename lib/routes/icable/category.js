const got = require('@/utils/got');

const timezone = require('@/utils/timezone');

function desc(item, option) {
    if (option === 'brief') {
        let ptext;
        let btext;
        // remove HTML tags from item.desc (exception for undefined or null item.desc)
        if (item.desc) {
            ptext = item.desc.replace(/<\/?[^>]+(>|$)/g, '');
        } else {
            ptext = item.desc;
        }
        // brief desc counts within 100 characters
        if (ptext && ptext.length && ptext.length > 100) {
            btext = `${ptext.substring(0, 100)}…`;
        } else {
            btext = ptext;
        }
        return `<p>${btext}<br><br>#${item.group_name} (${item.created_at})</p>`;
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
        result = data.filter((w) => w.group_id === '128');
        feedTitle = '港聞 - i-CABLE 即時新聞';
    } else if (category === 'international') {
        result = data.filter((w) => w.group_id === '136');
        feedTitle = '兩岸國際 - i-CABLE 即時新聞';
    } else if (category === 'china') {
        result = data.filter((w) => w.group_id === '18');
        feedTitle = '有線中國組 - i-CABLE 即時新聞';
    } else if (category === 'sports') {
        result = data.filter((w) => w.group_id === '321');
        feedTitle = '體育 - i-CABLE 即時新聞';
    } else {
        result = [{ desc: '暂不支持此类型，请到 https://github.com/DIYgod/RSSHub/issues 反馈' }];
    }

    const items = result.map((item) => ({
        title: item.title, // 文章标题
        author: '有線新聞', // 文章作者
        description: desc(item, option),
        pubDate: timezone(new Date(`${item.created_at}`), +8),
        // pubDate: `${item.created_at} +0800`, // 文章发布时间
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
