import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    let {
        uid
    } = ctx.params;

    if (isNaN(uid)) {
        const user_response = await got.get(`https://${uid}.zcool.com.cn/`);
        const $ = cheerio.load(user_response.data);
        uid = $('[data-id]').attr('data-id');
    }

    const url = `https://api.zcool.com.cn/v2/api/u/${uid}`;

    const response = await got.get(url);
    const {
        data
    } = response.data;

    const user = data.content[0].creatorObj;
    const list = data.content;

    const out = await Promise.all(
        list.map(async (item) => {
            const link = item.pageUrl;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const rssitem = {
                title: item.title,
                link,
                author: item.creatorObj.username,
                pubDate: new Date(item.createTime * 1),
            };

            try {
                const item_response = await got.get(link);
                const item_element = cheerio.load(item_response.data);
                const item_content_wrap = item_element('.work-content-wrap');
                const item_content = item_content_wrap.length !== 0 ? item_content_wrap : item_element('.work-show-box');
                rssitem.description = item_content.html();
            } catch {
                return '';
            }

            ctx.cache.set(link, JSON.stringify(rssitem));
            return rssitem;
        })
    );

    ctx.state.data = {
        title: '站酷 - ' + user.username,
        image: user.avatar,
        link: user.pageUrl,
        item: out.filter((item) => item !== ''),
    };
};
