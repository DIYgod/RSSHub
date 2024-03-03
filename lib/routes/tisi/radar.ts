export default {
    'tisi.org': {
        _name: '腾讯研究院',
        '.': [
            {
                title: '最近更新',
                docs: 'https://docs.rsshub.app/routes/new-media#teng-xun-yan-jiu-yuan',
                source: ['/'],
                target: (_params, url) => {
                    if (new URL(url).searchParams.get('page_id') === '11151') {
                        return '/tisi/latest';
                    }
                },
            },
        ],
    },
};
