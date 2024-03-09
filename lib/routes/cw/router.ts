export default (router) => {
    router.get('/author/:channel', './author');
    router.get('/master/:channel', './master');
    router.get('/sub/:channel', './sub');
    router.get('/today', './today');
};
