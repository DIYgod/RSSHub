// @ts-nocheck
export default (ctx) => {
    const types = {
        news: 'press-release',
        blog: 'article',
    };

    const { region = 'en', type = 'news' } = ctx.req.param();
    const redirectTo = `/aqara/${region}/category/${types[type]}`;
    ctx.redirect(redirectTo);
};
