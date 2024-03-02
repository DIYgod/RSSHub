export default (router) => {
    router.get('/posts/:cid/:sort?', './posts');
};
