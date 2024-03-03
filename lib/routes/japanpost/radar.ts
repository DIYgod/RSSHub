export default {
    'japanpost.jp': {
        _name: '日本郵便',
        'trackings.post': [
            {
                title: '郵便・荷物の追跡',
                docs: 'https://docs.rsshub.app/routes/other#japanpost-ri-ben-you-bian',
                source: '/services/srv/search/direct',
                target: (params, url) => {
                    const reqCode = new URL(url).searchParams
                        .get('reqCodeNo1')
                        .replaceAll(/[^\dA-Za-z]/g, '')
                        .toUpperCase();
                    const locale = new URL(url).searchParams.get('locale').toLowerCase();
                    if ((reqCode.search(/^(?:\d{11,12}|[A-Z]{2}\d{9}[A-Z]{2})$/) === 0 && locale === 'ja') || locale === 'en') {
                        return `/japanpost/track/${reqCode}/${locale}`;
                    }
                },
            },
        ],
    },
};
