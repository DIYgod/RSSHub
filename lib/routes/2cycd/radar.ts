export default {
    '2cycd.com': {
        _name: '二次元虫洞',
        '.': [
            {
                title: '板块',
                docs: 'https://docs.rsshub.app/routes/bbs#er-ci-yuan-chong-dong',
                source: '/:path',
                target: (params, url) => {
                    let pid, sort;
                    const static_matched = params.path.match(/forum-(\d+)-\d+.html/);
                    if (static_matched) {
                        pid = static_matched[1];
                    } else if (params.path === 'forum.php') {
                        pid = new URL(url).searchParams.get('fid');
                        sort = new URL(url).searchParams.get('orderby');
                    } else {
                        return false;
                    }
                    return `/2cycd/${pid}/${sort ?? 'dateline'}`;
                },
            },
        ],
    },
};
