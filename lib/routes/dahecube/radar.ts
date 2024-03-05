export default {
    'dahecube.com': {
        _name: '大河财立方',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#da-he-cai-li-fang',
                source: ['/channel.html', '/index.html'],
                target: (_, url) => {
                    const id = Number.parseInt(new URL(url).searchParams.get('recid'));
                    let type = 'recommend';
                    const TypeMap = {
                        recommend: {
                            name: '推荐',
                            id: 1,
                        },
                        history: {
                            name: '党史',
                            id: 37,
                        },
                        stock: {
                            name: '豫股',
                            id: 2,
                        },
                        business: {
                            name: '财经',
                            id: 4,
                        },
                        education: {
                            name: '投教',
                            id: 36,
                        },
                        finance: {
                            name: '金融',
                            id: 5,
                        },
                        science: {
                            name: '科创',
                            id: 19,
                        },
                        invest: {
                            name: '投融',
                            id: 29,
                        },
                        column: {
                            name: '专栏',
                            id: 33,
                        },
                    };
                    for (const [key, value] of Object.entries(TypeMap)) {
                        if (value.id === id) {
                            type = key;
                        }
                    }
                    return `/dahecube/${type}`;
                },
            },
        ],
    },
};
