module.exports = {
    'vimeo.com': {
        _name: 'Vimeo',
        '.': [
            {
                title: 'User videos',
                docs: 'https://docs.rsshub.app/social-media.html#vimeo-yong-hu-ye-mian',
                source: '/:username/',
                target: (params, url, document) => {
                    const uid = document && document.querySelector('html').innerHTML.match(/app.vimeo.com\/users\/([0-9]+)/)[1];
                    return uid ? `/vimeo/user/${uid}` : '';
                },
            },
            {
                title: 'User Video Category',
                docs: 'https://docs.rsshub.app/social-media.html#vimeo-yong-hu-ye-mian',
                source: '/',
            },
            {
                title: 'Channel',
                docs: 'https://docs.rsshub.app/social-media.html#vimeo-channel',
                source: ['/channels/:channel', '/channels/:channel/videos', '/channels/:channel/videos/:sort/:format'],
                target: '/vimeo/channel/:channel',
            },
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/social-media.html#vimeo-category',
                source: ['/categories/:category', '/categories/:category/:subcategory', '/categories/:category/:subcategory/videos'],
                target: (params) => `/vimeo/category/:category${params.subcategory ? `/` + params.subcategory : ''}`,
            },
        ],
    },
};
