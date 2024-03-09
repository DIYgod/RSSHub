export default (router) => {
    // 哈尔滨工业大学
    router.get('/hitgs', './hitgs');
    router.get('/jwc', './jwc');
    router.get('/today/:category', './today');
};
