// @ts-nocheck
export default (ctx) => {
    const { channel } = ctx.req.param();
    const redirectTo = `/liulinblog/${channel}`;
    ctx.redirect(redirectTo);
};
