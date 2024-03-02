export default (router) => {
    router.get('/cmse/:type?', './cmse');
    router.get('/cs/:type?', './cs');
    router.get('/epe/:type?', './epe');
    router.get('/mech/:type?', './mech');
    router.get('/sc/:type?', './sc');
    router.get('/wh/news/:column?', './wh/news');
    router.get('/wh/jwc/:column?', './wh/jwc');
};
