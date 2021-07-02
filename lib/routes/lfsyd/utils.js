const cheerio = require('cheerio');
const got = require('@/utils/got');
const md5 = require('@/utils/md5');

const rootUrl = 'https://www.iyingdi.com';
const ProcessFeed = async (ctx, item) => {
    const infoUrL = 'https://api.iyingdi.com/web/post/info';
    const infoForm = {
        post_id: item.postId,
        timestamp: '',
    };
    const description = await ctx.cache.tryGet(item.link, async () => {
        const response = await got({
            method: 'post',
            url: infoUrL,
            headers: {
                Host: 'api.iyingdi.com',
                'Login-Token': 'nologin',
                Origin: rootUrl,
                Platform: 'pc',
                Referer: `${rootUrl}/`,
            },
            form: getForm(infoForm),
        });
        return cleanHtml(JSON.parse(response.body).post.content);
    });
    item.description = description;
    delete item.postId;
    return item;
};
const getForm = function (form, type) {
    const key = type ? '8a11ed3712b699e749185674f1dc20b4' : 'b8d5b38577b8bb382b0c783b474b95f9';
    form.key = key;
    form.timestamp = Math.floor(new Date().getTime() / 1000);
    form.sign = md5(new URLSearchParams(form).toString());
    delete form.key;
    return form;
};

const cleanHtml = function (htmlString) {
    const regex = new RegExp('(<p>|<div>)(.*?)?<strong>(标准|狂野)日报投稿.*?</strong>(.*?)?(</p>|</div>)(.|\n)*$');
    const $ = cheerio.load(htmlString.replace(regex, ''));
    $('.yingdi-car,.bbspost,.deck-set').each(function (i, e) {
        const className = $(e).attr('class');
        const dataId = $(e).attr('data-id');
        const decksUrl = `${rootUrl}/web/tools/hearthstone/decks/setdetail?setid=${dataId}`;
        const url = className === 'yingdi-card bbspost' ? `${rootUrl}/tz/post/${dataId}` : decksUrl;
        $(e).find('.card-status').remove();
        $(e).find('.card-info').wrap(`<a href = "${url}"></a>`);
    });

    $('.yingdi-image.gif').each(function (i, e) {
        const imgsrc = $(e).attr('data-original');
        $(e).attr('src', imgsrc);
    });

    $('.yingdi-audio').each(function (i, e) {
        $(e).find('.audio-cover').remove();
        $(e).find('.audio-area.hidden').attr('class', 'audio-area');
    });

    // 用户头像
    $('.yingdi-card.user').remove();
    // 套牌代码复制
    $('.action-button').remove();
    // 投票
    $('.yingdi-ballot').remove();
    $('hr').remove();
    return $.html();
};

module.exports = {
    getForm,
    ProcessFeed,
};
