module.exports = (router) => {
    router.get('/', require('./index'));
    router.get('/discussed', require('./discussed'));
    router.get('/upvoted', require('./upvoted'));
};
