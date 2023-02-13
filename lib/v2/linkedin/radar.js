module.exports = {
    'linkedin.com': {
        _name: 'LinkedIn',
        '.': [
            {
                title: 'Job Listing',
                docs: 'https://docs.rsshub.app/en/other.html#linkedin-jobs',
                source: '/jobs/search/',
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    const parseRoute = (searchParam) => {
                        if (typeof searchParam !== 'string') {
                            return 'all';
                        }
                        return searchParam.split(',').join('-');
                    };
                    return `/linkedin/jobs/${parseRoute(searchParams.get('f_JT'))}/${parseRoute(searchParams.get('f_E'))}/${searchParams.get('keywords') || ''}`;
                },
            },
        ],
    },
    'linkedin.cn': {
        _name: 'LinkedIn 领英中国',
        '.': [
            {
                title: 'Jobs',
                docs: 'https://docs.rsshub.app/other.html#linkedin-ling-ying-zhong-guo',
                source: '/incareer/jobs/search',
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    return `/linkedin/cn/jobs/${searchParams.get('keywords') || ''}`;
                },
            },
        ],
    },
};
