module.exports = (router) => {
    router.get('/student5/boards', require('./boards'));
    router.get('/student5/:board?', require('./student5'));
};
