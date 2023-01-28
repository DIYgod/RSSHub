module.exports = {
    'linkedin.cn': {
        _name: 'linkedin',
        '.': [
            {
                title: 'Job Listing',
                docs: 'https://docs.rsshub.app/other.html#linkedin-cn-ling-ying-zhong-guo',
                source: '/incareer/jobs/search',
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    return `/linkedincn/jobs/${searchParams.get('keywords') || ''}`;
                },
            },
        ],
    },
};
