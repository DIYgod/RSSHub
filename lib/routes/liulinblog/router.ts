export default (router) => {
    router.get('/itnews/:channel', './itnews');
    router.get('/:params*', './');
};
