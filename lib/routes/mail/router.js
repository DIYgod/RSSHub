export default (router) => {
    router.get('/imap/:email/', './imap');
    router.get('/imap/:email/:folder{.+}', './imap');
};
