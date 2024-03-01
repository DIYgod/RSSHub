export default (router) => {
    router.get('/bbs/profile/thread/:userId', './profile/thread');
    router.get('/bbs/special/:specialId', './special');
};
