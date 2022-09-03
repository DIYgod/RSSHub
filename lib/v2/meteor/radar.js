module.exports = {
    'meteor.today': {
        _name: 'Meteor',
        '.': [
            {
                title: '看板',
                docs: 'https://docs.rsshub.app/bbs.html#meteor',
                source: ['/board/:board', '/board/:board/new'],
                target: '/meteor/board/:board',
            },
            {
                title: '看板列表',
                docs: 'https://docs.rsshub.app/bbs.html#meteor',
                source: ['/'],
                target: '/meteor/boards',
            },
        ],
    },
};
