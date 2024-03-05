export default {
    'yangtzeu.edu.cn': {
        _name: '长江大学',
        '.': [
            {
                title: '动物科学学院',
                docs: 'https://docs.rsshub.app/routes/universities#chang-jiang-da-xue-dong-wu-ke-xue-xue-yuan',
                source: ['/:category', '/'],
                target: (params, url) => {
                    url = new URL(url);
                    const path = /\.edu\.cn(.*?)\.htm/.test(url.href) ? url.href.match(/\.edu\.cn(.*?)\.htm/)[1] : '';

                    return `/yangtzeu/dongke${path}`;
                },
            },
        ],
    },
};
