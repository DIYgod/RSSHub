module.exports = (router) => {
    router.get('/bidding', require('./bidding'));
    router.get('/newshub-zh', require('./newshub-zh'));
    router.get('/yjs', require('./yjs'));
};
