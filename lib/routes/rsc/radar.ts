export default {
    'rsc.org': {
        _name: 'The Royal Society of Chemistry',
        pubs: [
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/routes/journal#royal-society-of-chemistry',
                source: ['/en/journals/journalissues/:id', '/en/content/articlelanding', '/en/content/articlehtml'],
                target: (params, url) => {
                    url = new URL(url);
                    const matches = url.href.match(/(?:journals\/journalissues\/|content\/articlelanding\/\d+\/|content\/articlehtml\/\d+\/)(\w+)/);

                    if (matches) {
                        const id = matches[1];
                        return `/rsc/journal/${id}`;
                    }

                    return '/rsc/journal/:id';
                },
            },
        ],
    },
};
