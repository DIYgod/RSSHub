export default {
    'dlut.edu.cn': {
        _name: '大连理工大学',
        dutdice: [
            {
                title: '国际合作与交流处（港澳台办）',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-guo-ji-he-zuo-yu-jiao-liu-chu-gang-ao-tai-ban',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
        eda: [
            {
                title: '开发区校区',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-kai-fa-qu-xiao-qu',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
        fldpj: [
            {
                title: '公共基础学院',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-gong-gong-ji-chu-xue-yuan',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
        gs: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-yan-jiu-sheng-yuan',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
        news: [
            {
                title: '新闻网',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-xin-wen-wang',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
        panjin: [
            {
                title: '盘锦校区',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-pan-jin-xiao-qu',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
        perdep: [
            {
                title: '人事处',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-ren-shi-chu',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
        pjteach: [
            {
                title: '盘锦校区教务教学事务办公室',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-pan-jin-xiao-qu-jiao-wu-jiao-xue-shi-wu-ban-gong-shi',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
        pjxqzwb: [
            {
                title: '盘锦校区总务部',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-pan-jin-xiao-qu-zong-wu-bu',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
        ssdut: [
            {
                title: '软件学院',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-ruan-jian-xue-yuan',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
        teach: [
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-jiao-wu-chu',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
        tjpj: [
            {
                title: '体育与健康学院盘锦分院',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-ti-yu-jian-kang-xue-yuan-pan-jin-fen-yuan',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
        tycgzx: [
            {
                title: '体育场馆中心',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-ti-yu-chang-guan-zhong-xin',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
        xsgzb: [
            {
                title: '盘锦校区学生事务办公室',
                docs: 'https://docs.rsshub.app/routes/university#da-lian-li-gong-da-xue-pan-jin-xiao-qu-xue-sheng-shi-wu-ban-gong-shi',
                source: ['/'],
                target: (params, url) => `/dut/${url.match(/:\/{2}\w+\./)[1]}/${url.match(/\.cn\/(.*)\.htm/)[1]}`,
            },
        ],
    },
};
