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
        const body = JSON.parse(response.body);
        return cleanHtml(body.post.content);
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
    // 替换 js实现的跳转
    if ($('.yingdi-car,.bbspost,.deck-set').length > 0) {
        const yingdiCarReplace = $('.yingdi-car,.bbspost,.deck-set');
        $(yingdiCarReplace).each(function () {
            const className = $(this).attr('class');
            const dataId = $(this).attr('data-id');
            const imgsrc = $(this).find('.card-thumbnail img').attr('src');
            const title = $(this).find('.card-info .title').text();
            // const author = $(this).find('.card-info .author').text();
            const time = $(this).find('.card-info .time').text();
            let postUrl = '';
            if (className === 'yingdi-card bbspost') {
                postUrl = `${rootUrl}/tz/post/${dataId}`;
            } else {
                postUrl = `${rootUrl}/web/tools/hearthstone/decks/setdetail?btypes=home_allset&setid=${dataId}`;
            }
            $(this).replaceWith(`<figure><img src="${imgsrc}" alt=""></figure>\n<p><p><a href= "${postUrl}" target="_blank">${title}  ${time}</a></p>\n`);
        });
    }
    // 用户头像
    $('.yingdi-card.user').remove();
    // 套牌代码复制
    $('.action-button').remove();
    // 音频
    $('.yingdi-audio').remove();
    $('hr').remove();
    return $.html();
};

module.exports = {
    getForm,
    ProcessFeed,
};
