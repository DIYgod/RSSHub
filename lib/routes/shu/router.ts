export default (router) => {
    router.get('/:type?', './index');
    router.get('/jwc/:type?', './jwb'); // TODO: deprecated, remove this line when someone update this file next time
    router.get('/jwb/:type?', './jwb');
};
