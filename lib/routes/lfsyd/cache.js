const got = require('@/utils/got');
module.exports = {
    getContentFromLink: async (ctx, link, rootUrl, info_form) => {
        const key = link;
        const infoUrL = 'https://api.iyingdi.com/web/post/info';
        let content = await ctx.cache.get(key);
        if (!content) {
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
                form: info_form,
            });
            const content_body = JSON.parse(response.body);
            content = content_body.post.content;
            ctx.cache.set(key, content);
        }
        return content;
    },
};
