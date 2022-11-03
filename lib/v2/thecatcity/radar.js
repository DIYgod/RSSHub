const { termsMap } = require('./termsMap');

module.exports = {
    'thecatcity.com': {
        _name: '貓奴日常',
        '.': Object.entries(termsMap).map(([key, value]) => ({
            title: value.title,
            docs: 'https://docs.rsshub.app/new-media.html#mao-nu-ri-chang',
            source: [...new Set([value.slug, '/'])],
            target: `/thecatcity${key ? `/${key}` : ''}`,
        })),
    },
};
