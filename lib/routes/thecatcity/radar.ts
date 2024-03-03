const { termsMap } = require('./terms-map');

export default {
    'thecatcity.com': {
        _name: '貓奴日常',
        '.': Object.entries(termsMap).map(([key, value]) => ({
            title: value.title,
            docs: 'https://docs.rsshub.app/routes/new-media#mao-nu-ri-chang',
            source: [...new Set([value.slug, '/'])],
            target: `/thecatcity${key ? `/${key}` : ''}`,
        })),
    },
};
