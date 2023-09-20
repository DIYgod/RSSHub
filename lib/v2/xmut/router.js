module.exports = (router) => {
    router.get('/jwc/bkjw/:category?', require('./jwc/bkjw.js'));
    router.get('/jwc/yjjw/:category?', require('./jwc/yjs.js'));
};
