export default {
    'idai.ly': {
        _name: 'iDaily',
        '.': [
            {
                title: '每日环球视野',
                docs: 'https://docs.rsshub.app/routes/new-media#idaily-mei-ri-huan-qiu-shi-ye',
                source: ['/'],
                target: (_, url) => {
                    url = new URL(url);
                    const language = url.searchParams.get('lang');

                    return `/idaily${language ? `/${language}` : ''}`;
                },
            },
        ],
    },
};
