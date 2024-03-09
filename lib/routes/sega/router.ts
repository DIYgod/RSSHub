export default (router) => {
    router.get('maimaidx/news', './maimaidx.ts');
    router.get('/pjsekai/news', './pjsekai.ts');
};
