export default (router) => {
    router.get('/author/:uid', './author');
    router.get('/courses/:sort/:tag', './courses');
    router.get('/questions/:id', './questions');
};
