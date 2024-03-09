export default (router) => {
    // https://github.com/dword-design/package-name-regex/blob/master/src/index.js
    router.get('package/:name{(@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]*}', './package');
};
