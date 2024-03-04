export default {
    'behance.net': {
        _name: 'Behance',
        www: [
            {
                title: 'User',
                docs: 'https://docs.rsshub.app/routes/design#behance-yong-hu-zuo-pin',
                source: ['/:user', '/:user/:types', '/gallery/:galleryid/:galleryname'],
                target: (params, url, document) => {
                    let type = '';
                    if (params.types && params.types.match('appreciated')) {
                        type = '/appreciated';
                    }
                    const uid = /gallery\/\d+/.test(url)
                        ? document && document.querySelector('.e2e-project-avatar').childNodes[0].attributes[1].value.match(/behance.net\/(.*)/)[1]
                        : document && document.querySelector('html').innerHTML.match(/([^/]+)\/insights/)[1];

                    return `/behance/${uid}${type}`;
                },
            },
        ],
    },
};
