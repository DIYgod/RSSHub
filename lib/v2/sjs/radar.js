module.exports = {
    'xsijishe.com': {
        _name: '司机社',
        '.': [
            {
                title: '司机社论坛',
                docs: 'https://docs.rsshub.app/bbs.html#si-ji-she',
                source: ['/*'],
                target: (_, url) => {
                    const re = /forum-[0-9]+/;
                    const res = re.exec(url);
                    if (res) {
                        return `/sjs/forum/${res[0].replace('forum-', '')}`;
                    }
                },
            },
        ],
    },
};
