export default (router) => {
    router.get('/today/:language?', './');
    router.get('/:language?', './');
};
