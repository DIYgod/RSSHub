module.exports = (router) => {
    router.get('/cloudflareyes/:type?', './cloudflareyes');
    router.get('/cloudflareyesv6', './cloudflareyesv6');
};
