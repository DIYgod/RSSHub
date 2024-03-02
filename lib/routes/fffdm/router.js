export default (router) => {
    router.get('/manhua/:id/:cdn?', './manhua/manhua');
};
