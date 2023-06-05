module.exports = (router) => {
    router.get('/', require('./index'));
    router.get('/upvoted', require('./upvoted'));
    router.get('/discussed', require('./discussed'));
};