export default (router) => {
    router.get('/cg/:caty?', './cg/index');
    router.get('/genetics/:path+', './genetics/index');
    router.get('/ia/yjs', './ia/yjs');
    router.get('/iee/kydt', './iee/kydt');
    router.get('/is/:path+', './is/index');
    router.get('/mesalab/kb', './mesalab/kb');
    router.get('/sim/kyjz', './sim/kyjz');
};
