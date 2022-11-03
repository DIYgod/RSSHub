module.exports = (router) => {
    router.get('/:language/:domain?', require('./scripts'));
    router.get('/scripts/:script/feedback', require('./feedback'));
    router.get('/scripts/:script/versions', require('./versions'));
};
