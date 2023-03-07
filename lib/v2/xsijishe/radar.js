module.exports = {
    'xsijishe.com': {
        _name: '司机社',
        '.': [
            {
                title: '论坛',
                docs: 'https://docs.rsshub.app/bbs.html#si-ji-she',
                source: ['/*'],
                target: (_, url) => {
                    const re = /forum-(\d+)-/;
                    const res = re.exec(url);
                    if (res) {
                        return `/xsijishe/forum/${res[1]}`;
                    }
                },
            },
        ],
    },
};
