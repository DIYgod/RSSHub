module.exports = {
    'oshwhub.com': {
        _name: '立创开源硬件平台',
        '.': [
            {
                title: '开源广场',
                docs: 'https://docs.rsshub.app/other.html#li-chuang-kai-yuan-ying-jian-ping-tai',
                source: ['/explore'],
                target: (_, url) => {
                    const sortType = new URL(url).searchParams.get('projectSort');
                    return sortType ? `/oshwhub/${sortType}` : '';
                },
            },
        ],
    },
};
