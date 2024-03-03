export default (router) => {
    router.get('/cwc/:type?', './cwc');
    router.get('/dgxg/:type?', './dgxg');
    router.get('/eo/:grade?/:type?', './eo');
    router.get('/eoe/:type?', './eoe');
    router.get('/gs/:type?', './gs');
    router.get('/jwc/:type?', './jwc');
};
