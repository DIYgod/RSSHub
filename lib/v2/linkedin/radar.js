module.exports = {
    'linkedin.com': {
        _name: 'linkedin',
        '.': [
            {
                title: 'Job Listing',
                docs: 'https://docs.rsshub.app/en/other.html#linkedin-jobs',
                source: '/jobs/search/',
                target: (params, url) => {
                    const searchParams = new URLSearchParams(new URL('', url).search);
                    const parseRoute = (searchParam) => {
                        if (typeof searchParam !== 'string') {
                            return 'all';
                        }
                        return searchParam.split(',').join('-');
                    };
                    return `/jobs/${parseRoute(searchParams.get('f_JT'))}/${parseRoute(searchParams.get('f_E'))}/${searchParams.get('keywords') || ''}`;
                },
            },
        ],
    },
};
