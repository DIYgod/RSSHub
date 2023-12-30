const got = require('@/utils/got');
const { JSDOM } = require('jsdom');
const cache = require('./cache');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const userId = ctx.params.userId;
    const url = `https://node.kg.qq.com/personal?uid=${userId}`;
    const response = await got(url);

    const { window } = new JSDOM(response.data, {
        runScripts: 'dangerously',
    });
    const data = window.__DATA__;
    const author = data.data.nickname;
    const authorimg = data.data.head_img_url;
    const ugcList = data.data.ugclist;

    const items = await Promise.all(
        ugcList.map(async (item) => {
            const link = `https://node.kg.qq.com/play?s=${item.shareid}`;
            const item_info = await cache.getPlayInfo(ctx, item.shareid, item.ksong_mid);

            const single = {
                title: item.title || '',
                description: item_info.description,
                link,
                guid: `ksong:${item.ksong_mid}`,
                author,
                pubDate: parseDate(item_info.ctime * 1000) || parseDate(item.ctime, 'X'),
                itunes_item_image: item_info.itunes_item_image || item.avatar,
                enclosure_url: item_info.enclosure_url,
                enclosure_type: 'audio/x-m4a',
            };

            return single;
        })
    );

    ctx.state.data = {
        title: `${author} - 全民K歌`,
        link: url,
        description: data.share.content,
        allowEmpty: true,
        item: items,
        image: authorimg,
        itunes_author: author,
        itunes_category: '全民K歌',
    };
};
