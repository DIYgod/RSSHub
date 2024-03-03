export default {
    'questmobile.com.cn': {
        _name: 'QuestMobile',
        '.': [
            {
                title: '行业研究报告',
                docs: 'https://docs.rsshub.app/routes/new-media#questmobile-hang-ye-yan-jiu-bao-gao',
                source: ['/research/reports/:industry/:label'],
                target: (params) => {
                    const industry = params.industry;
                    const label = params.label;

                    return `/questmobile/report/${industry}/${label}`;
                },
            },
        ],
    },
};
