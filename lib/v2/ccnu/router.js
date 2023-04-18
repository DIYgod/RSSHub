module.exports = (router) => {
    router.get('/career', require('./career'));
    router.get('/cs', require('./cs'));
    router.get('/wu', require('./wu'));
    router.get('/yjs', require('./yjs'));
};
