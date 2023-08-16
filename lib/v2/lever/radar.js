module.exports = {
    'lever.co': {
        _name: 'Lever',
        '.': [
            {
                title: 'Lever HRIS Job Boards Feed',
                docs: 'https://docs.rsshub.app/routes/other#lever',
                source: ['/:domain'],
                target: '/lever/:domain',
            },
        ],
    },
};
