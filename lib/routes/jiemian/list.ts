// @ts-nocheck
export default (ctx) => {
    const id = ctx.req.param('id');

    const redirectTo = `/jiemian${id ? `/lists/${id}` : ''}`;
    ctx.redirect(redirectTo);
};
