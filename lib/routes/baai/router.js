export default (router) => {
    router.get('/hub/comments', './comments');
    router.get('/hub/events', './events');
    router.get('/hub/:tagId/:sort?/:range?', './hub');
    router.get('/hub/:tagId/:sort?', './hub');
    router.get('/hub/:sort?', './hub');
};
