module.exports = {
    'behance.net': {
        _name: 'Behance',
        www: [
            {
                title: 'User',
                docs: 'https://docs.rsshub.app/design.html#behance-yong-hu-zuo-pin',
                source: ['/:user', '/:user/:types', '/gallery/:galleryid/:galleryname'],
                target: (params, url, document) => {
                    let uid;
                    let type = '';
                    if (params.types && params.types.match('appreciated')) {
                        type = '/appreciated';
                    }
                    if (url.match(/gallery\/\d+/)) {
                        uid = document && document.querySelector('.e2e-project-avatar').childNodes[0].attributes[1].value.match(/behance.net\/(.*)/)[1];
                    } else {
                        uid = document && document.querySelector('html').innerHTML.match(/([^/]+)\/insights/)[1];
                    }

                    return `/behance/${uid}${type}`;
                },
            },
        ],
    },
};
