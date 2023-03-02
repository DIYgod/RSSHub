module.exports = (router) => {
    router.get('/', require('./latest'));
    router.get('/cat/:cat*', require('./cat'));
    router.get('/tag/:tag', require('./tag'));
};
