module.exports = (router) => {
    router.get('/main/:type', require('./main'));
    router.get('/jsj/:type', require('./jsj'));
    router.get('/yjs', require('./yjs'));
};
