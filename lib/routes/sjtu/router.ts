export default (router) => {
    router.get('/gs/:type/:num?', './gs');
    router.get('/jwc/:type?', './jwc');
    router.get('/seiee/academic', './seiee/academic');
    router.get('/seiee/bjwb/:type', './seiee/bjwb');
    router.get('/seiee/xsb/:type?', './seiee/xsb');
    router.get('/tongqu/:type?', './tongqu/activity');
    router.get('/yzb/zkxx/:type', './yzb/zkxx');
};
