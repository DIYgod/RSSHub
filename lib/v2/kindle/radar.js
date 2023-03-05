module.exports = {
    'amazon.com': {
        _name: 'Kindle',
        '.': [
            {
                title: '软件更新',
                docs: 'https://docs.rsshub.app/program-update.html#kindle',
                source: ['/gp/help/customer/display.html'],
                target: (_, url) => {
                    const nodeId = new URL(url).searchParams.get('nodeId');
                    if (nodeId === 'GKMQC26VQQMM8XSW') {
                        return '/kindle/software-updates';
                    }
                },
            },
        ],
    },
};
