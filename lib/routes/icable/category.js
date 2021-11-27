const got = require('@/utils/got');
const timezone = require('@/utils/timezone');

function desc(item, option) {
    if (option === 'withphoto') {
        return `<img src="${item.pic_url}"><p>${item.desc}</p>`;
    } else if (option === 'plain') {
        return item.desc;
    } else {
        throw Error(`Invalid option ‘<code>${option}</code>’. Please refer to <a href="https://docs.rsshub.app/traditional-media.html#i-cable-you-xian-xin-wen">the documention</a>.`);
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
        throw Error(`Invalid category ‘<code>${category}</code>’. Please refer to <a href="https://docs.rsshub.app/traditional-media.html#i-cable-you-xian-xin-wen">the documention</a>.`);
    }

    const items = result.map((item) => ({
        title: item.title,
        author: '有線新聞',
        category: item.group_name,
        description: desc(item, option),
        pubDate: timezone(new Date(String(item.created_at)), +8),
        guid: item.id,
        link: `http://cablenews.i-cable.com/ci/news/article/37/${item.id}`,
    }));

    ctx.state.data = {
        title: feedTitle,
        link: 'http://cablenews.i-cable.com/ci/news/listing',
        description: '有線新聞 - 走在事實最前線',
        item: items,
    };
};
