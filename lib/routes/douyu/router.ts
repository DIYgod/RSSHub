export default (router) => {
    router.get('/group/:id/:sort?', './group');
    router.get('/post/:id', './post');
    router.get('/room/:id', './room');
};
