export default (router) => {
    router.get('/student5/boards', './boards');
    router.get('/student5/:board?', './student5');
};
