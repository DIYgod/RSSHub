export default {
    'amazon.com': {
        _name: 'Amazon',
        '.': [
            {
                title: 'Kindle 软件更新',
                docs: 'https://docs.rsshub.app/routes/program-update#amazon',
                source: ['/gp/help/customer/display.html'],
                target: (_, url) => {
                    const nodeId = new URL(url).searchParams.get('nodeId');
                    if (nodeId === 'GKMQC26VQQMM8XSW') {
                        return '/amazon/kindle/software-updates';
                    }
                },
            },
        ],
        aws: [
            {
                title: 'AWS blogs',
                docs: 'https://docs.rsshub.app/routes/blogs#amazon',
            },
        ],
    },
};
