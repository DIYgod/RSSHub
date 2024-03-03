export default {
    'vimeo.com': {
        _name: 'Vimeo',
        '.': [
            {
                title: 'User videos',
                docs: 'https://docs.rsshub.app/routes/social-media#vimeo-yong-hu-ye-mian',
                source: '/:username/',
                target: (params, url, document) => {
                    const uid = document && document.querySelector('html').innerHTML.match(/app.vimeo.com\/users\/(\d+)/)[1];
                    return uid ? `/vimeo/user/${uid}` : '';
                },
            },
            {
                title: 'User Video Category',
                docs: 'https://docs.rsshub.app/routes/social-media#vimeo-yong-hu-ye-mian',
                source: '/',
            },
            {
                title: 'Channel',
                docs: 'https://docs.rsshub.app/routes/social-media#vimeo-channel',
                source: ['/channels/:channel', '/channels/:channel/videos', '/channels/:channel/videos/:sort/:format'],
                target: '/vimeo/channel/:channel',
            },
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/routes/social-media#vimeo-category',
                source: ['/categories/:category', '/categories/:category/:subcategory', '/categories/:category/:subcategory/videos'],
                target: (params) => `/vimeo/category/:category${params.subcategory ? `/` + params.subcategory : ''}`,
            },
        ],
    },
};
