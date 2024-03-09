export default (router) => {
    router.get('/bios/:model', './bios');
    router.get('/gpu-tweak', './gpu-tweak');
};
