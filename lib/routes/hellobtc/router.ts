export default (router) => {
    router.get('/information/:channel?', './information');
    router.get('/news', './news');
    router.get('/kepu/:channel?', './kepu');
};
