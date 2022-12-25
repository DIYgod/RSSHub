const reactnewslettercom = require('./reactnewslettercom');
const bytesdev = require('./bytesdev');
module.exports = function (router) {
    router.get('/reactnewsletter', reactnewslettercom);
    router.get('/bytes', bytesdev);
};
