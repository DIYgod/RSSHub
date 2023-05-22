module.exports = (router) => {
    router.get('/:preview?', require('./index'));
    router.get('/search/:keyword/:preview?', require('./index'));
};
