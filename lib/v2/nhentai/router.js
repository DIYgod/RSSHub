module.exports = (router) => {
    router.get('/search/:keyword/:mode?', require('./search'));
    router.get('/:key/:keyword/:mode?', require('./other'));
};
