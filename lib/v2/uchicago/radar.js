module.exports = {
    'journals.uchicago.edu': {
        _name: 'The University of Chicago Press: Journals',
        '.': [
            {
                title: 'Current Issue',
                docs: 'https://docs.rsshub.app/journal.html#the-university-of-chicago-press-journals',
                source: ['/toc/:journal/current', '/journal/:journal'],
                target: '/uchicago/journals/current/:journal',
            },
        ],
    },
};
