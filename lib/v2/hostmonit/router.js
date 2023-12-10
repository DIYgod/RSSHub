const redirectToV6 = (ctx) => ctx.redirect('/hostmonit/cloudflareyes/v6');

module.exports = (router) => {
    router.get('/cloudflareyes/:type?', require('./cloudflareyes'));
    router.get('/cloudflareyesv6', (ctx) => redirectToV6(ctx));
    router.get('/CloudFlareYes/:type?', require('./cloudflareyes'));
    router.get('/CloudFlareYesv6', (ctx) => redirectToV6(ctx));
};
