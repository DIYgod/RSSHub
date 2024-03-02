export default (router) => {
    router.get('/:language/:domain?', './scripts');
    router.get('/scripts/:script/feedback', './feedback');
    router.get('/scripts/:script/versions', './versions');
    router.get('/scripts/sort/:sort/:language?', './scripts');
};
