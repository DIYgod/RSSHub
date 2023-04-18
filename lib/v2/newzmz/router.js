module.exports = (router) => {
    router.get('/:category?', require('./index'));
    router.get('/view/:id', require('./view'));
};
