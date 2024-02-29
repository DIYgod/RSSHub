module.exports = (router) => {
    router.get('/imap/:email/:folder*', './imap');
};
