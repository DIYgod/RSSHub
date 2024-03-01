export default (router) => {
    router.get('/awsblogs/:locale?', './awsblogs');
    router.get('/kindle/software-updates', './kindle-software-updates');
};
