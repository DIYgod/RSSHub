export default {
    'csdn.net': {
        _name: 'CSDN',
        blog: [
            {
                title: '博客',
                docs: 'https://docs.rsshub.app/routes/blog#csdn',
                source: ['/:user'],
                target: '/csdn/blog/:user',
            },
        ],
    },
};
