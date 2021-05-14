const cheerio = require('cheerio');
const got = require('@/utils/got');
const md5 = require('@/utils/md5');

const ProcessFeed = async (ctx, item) => {
    const infoUrL = 'https://api.iyingdi.com/web/post/info';
    const rootUrl = 'https://www.iyingdi.com';
    const info_form = {
        post_id: item.post_id,
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
            form: getForm(info_form),
        });
        const content_body = JSON.parse(response.body);
        return cleanHtml(content_body.post.content);
    });

    item.description = description;
    delete item.post_id;
    return item;
};

const getForm = function (form) {
    const key = 'b8d5b38577b8bb382b0c783b474b95f9';
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
    // 水平线
    $('hr').remove();
    return $.html();
};

module.exports = {
    getForm,
    ProcessFeed,
};
