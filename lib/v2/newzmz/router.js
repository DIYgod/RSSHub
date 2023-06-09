module.exports = (router) => {
    router.get(/\/(\d+)?/, require('./index'));
    router.get('/view/:id', require('./view'));
    router.get('/:id', require('./view'));
};
