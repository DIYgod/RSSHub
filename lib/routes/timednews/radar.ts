export default {
    'timednews.com': {
        _name: '时刻新闻',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#shi-ke-xin-wen',
                source: ['/topic/:type/:id'],
                target: ({ type, id }) => {
                    let name = '';
                    if (type === 'cat') {
                        if (id === '1') {
                            name = 'all';
                        }
                    } else if (type === 'subcat') {
                        switch (id) {
                            case '1':
                                name = 'currentAffairs';
                                break;
                            case '2':
                                name = 'finance';
                                break;
                            case '3':
                                name = 'technology';
                                break;
                            case '4':
                                name = 'social';
                                break;
                            case '5':
                                name = 'sports';
                                break;
                            case '6':
                                name = 'international';
                                break;
                            case '7':
                                name = 'usa';
                                break;
                            case '8':
                                name = 'cn';
                                break;
                            case '9':
                                name = 'europe';
                                break;
                            case '14':
                                name = 'comments';
                                break;
                            default:
                                break;
                        }
                    }

                    return `/timednews/news/${name}`;
                },
            },
        ],
    },
};
