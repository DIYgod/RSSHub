export default {
    'jjwxc.net': {
        _name: '晋江文学城',
        '.': [
            {
                title: '作者最新作品',
                docs: 'https://docs.rsshub.app/routes/reading#jin-jiang-wen-xue-cheng-zuo-zhe-zui-xin-zuo-pin',
                source: ['oneauthor.php'],
                target: (_, url) => {
                    url = new URL(url);
                    const id = url.searchParams.get('authorid');

                    return `/jjwxc/author/${id}`;
                },
            },
            {
                title: '作品',
                docs: 'https://docs.rsshub.app/routes/reading#jin-jiang-wen-xue-cheng-zuo-pin',
                source: ['onebook.php'],
                target: (_, url) => {
                    url = new URL(url);
                    const id = url.searchParams.get('novelid');

                    return `/jjwxc/book/${id}`;
                },
            },
        ],
    },
};
