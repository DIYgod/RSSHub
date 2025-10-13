module.exports = {
    'mymusicsheet.com': {
        _name: 'MyMusicSheet',
        '.': [
            {
                title: 'User Sheets',
                docs: 'https://docs.rsshub.app/routes/shopping#mymusicsheet-user-sheets',
                source: [':username/*', '/:username'],
                target: '/mymusicsheet/user/sheets/:username',
            },
        ],
    },
};
