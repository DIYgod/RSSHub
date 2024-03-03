export default {
    'parliament.go.th': {
        _name: 'รัฐสภา',
        '.': [
            {
                title: 'รับฟังความคิดเห็นต่อร่าง พ.ร.บ. ตามมาตรา 77 ของรัฐธรรมนูญ',
                docs: 'https://docs.rsshub.app/routes/government#thailand-parliament',
                source: ['/section77/index.php', '/section77/survey_list77.php', '/section77/survey_more_news.php'],
                target: (_params, url) => {
                    const queryParams = new URL(url).searchParams;
                    let rssPath = '/parliament/section77';
                    if (!queryParams.has('type')) {
                        return rssPath;
                    }

                    rssPath += `/${encodeURIComponent(queryParams.get('type'))}`;
                    return rssPath;
                },
            },
        ],
    },
};
