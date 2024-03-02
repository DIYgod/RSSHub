export default (router) => {
    router.get('/lives/:category?', './lives');
    router.get('/timeline/:category?', './timeline');
    router.get('/:category?', './catalogue');
};
