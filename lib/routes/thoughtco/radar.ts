export default {
    'thoughtco.com': {
        _name: 'ThoughtCo',
        '.': [
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category',
                source: ['/:category'],
                target: (params) => {
                    const category = params.category;

                    return `/thoughtco${category ? `/${category}` : ''}`;
                },
            },
            {
                title: 'Science, Tech, Math - Science',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-science-tech-math',
                source: ['/science-4132464'],
                target: '/thoughtco/science-4132464',
            },
            {
                title: 'Science, Tech, Math - Math',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-science-tech-math',
                source: ['/math-4133545'],
                target: '/thoughtco/math-4133545',
            },
            {
                title: 'Science, Tech, Math - Social Sciences',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-science-tech-math',
                source: ['/social-sciences-4133522'],
                target: '/thoughtco/social-sciences-4133522',
            },
            {
                title: 'Science, Tech, Math - Computer Science',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-science-tech-math',
                source: ['/computer-science-4133486'],
                target: '/thoughtco/computer-science-4133486',
            },
            {
                title: 'Science, Tech, Math - Animals & Nature',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-science-tech-math',
                source: ['/animals-and-nature-4133421'],
                target: '/thoughtco/animals-and-nature-4133421',
            },
            {
                title: 'Humanities - History & Culture',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-humanities',
                source: ['/history-and-culture-4133356'],
                target: '/thoughtco/history-and-culture-4133356',
            },
            {
                title: 'Humanities - Visual Arts',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-humanities',
                source: ['/visual-arts-4132957'],
                target: '/thoughtco/visual-arts-4132957',
            },
            {
                title: 'Humanities - Literature',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-humanities',
                source: ['/literature-4133251'],
                target: '/thoughtco/literature-4133251',
            },
            {
                title: 'Humanities - English',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-humanities',
                source: ['/english-4688281'],
                target: '/thoughtco/english-4688281',
            },
            {
                title: 'Humanities - Geography',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-humanities',
                source: ['/geography-4133035'],
                target: '/thoughtco/geography-4133035',
            },
            {
                title: 'Humanities - Philosophy',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-humanities',
                source: ['/philosophy-4133025'],
                target: '/thoughtco/philosophy-4133025',
            },
            {
                title: 'Humanities - Issues',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-humanities',
                source: ['/issues-4133022'],
                target: '/thoughtco/issues-4133022',
            },
            {
                title: 'Languages - English as a Second Language',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-languages',
                source: ['/esl-4133095'],
                target: '/thoughtco/esl-4133095',
            },
            {
                title: 'Languages - Spanish',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-languages',
                source: ['/spanish-4133085'],
                target: '/thoughtco/spanish-4133085',
            },
            {
                title: 'Languages - French',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-languages',
                source: ['/french-4133079'],
                target: '/thoughtco/french-4133079',
            },
            {
                title: 'Languages - German',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-languages',
                source: ['/german-4133073'],
                target: '/thoughtco/german-4133073',
            },
            {
                title: 'Languages - Italian',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-languages',
                source: ['/italian-4133069'],
                target: '/thoughtco/italian-4133069',
            },
            {
                title: 'Languages - Japanese',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-languages',
                source: ['/japanese-4133062'],
                target: '/thoughtco/japanese-4133062',
            },
            {
                title: 'Languages - Mandarin',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-languages',
                source: ['/mandarin-4133057'],
                target: '/thoughtco/mandarin-4133057',
            },
            {
                title: 'Languages - Russian',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-languages',
                source: ['/russian-4175265'],
                target: '/thoughtco/russian-4175265',
            },
            {
                title: 'Resources - For Students & Parents',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-resources',
                source: ['/for-students-parents-4132588'],
                target: '/thoughtco/for-students-parents-4132588',
            },
            {
                title: 'Resources - For Educators',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-resources',
                source: ['/for-educators-4132509'],
                target: '/thoughtco/for-educators-4132509',
            },
            {
                title: 'Resources - For Adult Learners',
                docs: 'https://docs.rsshub.app/routes/new-media#thoughtco-category-resources',
                source: ['/for-adult-learners-4132469'],
                target: '/thoughtco/for-adult-learners-4132469',
            },
        ],
    },
};
