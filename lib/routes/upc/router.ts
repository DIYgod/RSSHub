export default (router) => {
    router.get('/main/:type', './main');
    router.get('/jsj/:type', './jsj');
    router.get('/yjs', './yjs');
};
