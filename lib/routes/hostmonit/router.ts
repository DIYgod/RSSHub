export default (router) => {
    router.get('/cloudflareyes/:type?', './cloudflareyes');
    router.get('/cloudflareyesv6', './cloudflareyesv6');
};
