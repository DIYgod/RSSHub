const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const { finishArticleItem } = require('@/utils/wechat-mp');

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
            const single = {
                title,
                link,
                guid: link,
            };
            return await finishArticleItem(ctx, single);
        })
    );
    ctx.state.data = {
        title: mptitle,
        link: `https://mp.weixin.qq.com/mp/appmsgalbum?__biz=${biz}&action=getalbum${aidurl}`,
        item: list.map((item, index) => ({
            title: articledata[index].title,
            description: $(item).find('.album__item-img').html() + `<br><br>${articledata[index].description}`,
            link: articledata[index].link,
            guid: articledata[index].guid,
            author: articledata[index].author,
            pubDate: dayjs.unix($(item).find('.js_article_create_time').text()).format(),
        })),
    };
};
