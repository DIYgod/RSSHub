module.exports = {
    'urbandictionary.com': {
        _name: 'Urban Dictionary',
        '.': [
            {
                title: 'Random words',
                docs: 'https://docs.rsshub.app/routes/en/other#urban-dictionary',
                source: ['/random.php', '/'],
                target: '/urbandictionary/random',
            },
        ],
    },
};
