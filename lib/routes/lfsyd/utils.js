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
        return content_body.post.content;
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
module.exports = {
    getForm,
    ProcessFeed,
};
