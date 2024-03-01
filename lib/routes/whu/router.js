export default (router) => {
    router.get('/cs/:type', './cs');
    router.get('/gs/:type?', './gs/index.js');
    router.get('/hyxt/:category*', './hyxt');
    router.get('/news/:category*', './news');
};
