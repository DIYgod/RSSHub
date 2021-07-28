const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
module.exports = async (ctx) => {
    const { biz, aid } = ctx.params;
    const aidurl = `&album_id=${aid}`;

    const HTMLresponse = await got({
        method: 'get',
        url: `https://mp.weixin.qq.com/mp/appmsgalbum?__biz=${biz}&action=getalbum${aidurl}`,
    });
    const $ = cheerio.load(HTMLresponse.data);
    const list = $('li').get();
    const mptitle = $('.album__author-name').text() + `|` + $('.album__label-title').text();
    const articledata = await Promise.all(
        list.map(async (item) => {
            const link = $(item).attr('data-link').replace('http://', 'https://');
            const title = $(item).attr('data-title');
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response2 = await got({
                method: 'get',
                url: link,
            });
            const articleHtml = response2.data;
            const $2 = cheerio.load(articleHtml);
            $2('img').removeAttr('src');
            $2('div#js_profile_qrcode').remove();

            const content = $2('div#js_content.rich_media_content')
                .html()
                .replace('iframe/preview.html?width=500&amp;height=375&amp;', 'txp/iframe/player.html?')
                .replace('<iframe ', '<iframe width="640" height="360"')
                .replace(/data-src/g, 'src');
            const author = $2('div#meta_content:not(:last-child)').text();
            const single = {
                content,
                author,
                link,
                title,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `${mptitle}`,
        link: `https://mp.weixin.qq.com/mp/appmsgalbum?__biz=${biz}&action=getalbum${aidurl}`,
        item: list.map((item, index) => ({
            title: `${articledata[index].title}`,
            description: $(item).find('.album__item-img').html() + `<br><br>${articledata[index].content}`,
            link: `${articledata[index].link}`,
            author: `${articledata[index].author}`,
            pubDate: dayjs.unix($(item).find('.js_article_create_time').text()).format(),
        })),
    };
};
