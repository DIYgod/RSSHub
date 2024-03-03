export default {
    'getquicker.net': {
        _name: 'Quicker',
        '.': [
            {
                title: '动作分享',
                docs: 'https://docs.rsshub.app/routes/programming#quicker-dong-zuo-fen-xiang',
                source: ['/Share/:category', '/'],
                target: '/quicker/share/:category?',
            },
            {
                title: '讨论区',
                docs: 'https://docs.rsshub.app/routes/programming#quicker-tao-lun-qu',
                source: ['/QA', '/'],
                target: (params, url) => `/quicker/qa/${new URL(url).searchParams.get('category') ?? ''}/${new URL(url).searchParams.get('state') ?? ''}`,
            },
            {
                title: '用户动作更新',
                docs: 'https://docs.rsshub.app/routes/programming#quicker-yong-hu-dong-zuo-geng-xin',
                source: ['/QA', '/'],
                target: (params, url) => `/quicker/qa/${new URL(url).searchParams.get('category') ?? ''}/${new URL(url).searchParams.get('state') ?? ''}`,
            },
            {
                title: '版本更新',
                docs: 'https://docs.rsshub.app/routes/programming#quicker-ban-ben-geng-xin',
                source: ['/Help/Versions', '/'],
                target: '/quicker/versions',
            },
        ],
    },
};
