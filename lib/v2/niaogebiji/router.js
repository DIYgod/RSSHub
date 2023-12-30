module.exports = (router) => {
    router.get('/', require('./index'));
    router.get('/cat/:cat', require('./cat'));
    router.get('/today', require('./today'));
};
