export default (router) => {
    router.get('/blog/:tag?', './blog');
    router.get('/chatgpt/release-notes', './chatgpt');
    router.get('/research', './research');
};
