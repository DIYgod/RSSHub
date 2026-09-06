import type { Route } from '@/types';

export const REQUIRE_CONFIG: NonNullable<Route['features']>['requireConfig'] = [
    {
        name: 'SDO_FF14RISINGSTONES',
        description: '值为 Cookie 头中 ff14risingstones 值',
    },
    {
        // https://github.com/StarHeartHunt/ff14risingstone_sign_task/issues/17
        name: 'SDO_UA',
        description: '值为与在网页端获取 Cookie 时相匹配的 User-Agent 值',
    },
];

export const API_URL = 'https://apiff14risingstones.web.sdo.com/api';

export const ORIGIN = 'https://ff14risingstones.web.sdo.com';
export const INDEX_URL = `${ORIGIN}/pc/index.html`;

export const LOGO_URL = `${ORIGIN}/pc/favicon.ico`;

// source: /api/home/recruit/styleConfigList
export const PLAY_STYLE = {
    '2': '采矿/园艺',
    '3': '成就收集',
    '4': '大型任务',
    '5': '钓鱼',
    '6': '多玛方城战',
    '7': '房屋',
    '8': '怪物狩猎',
    '9': '集体动作',
    '10': '角色扮演',
    '11': '金碟游乐场',
    '18': '练级',
    '19': '休闲玩家',
    '20': '硬核玩家',
    '21': '主线',
    '22': '赚钱',
    '23': '武具投影',
    '26': '乐器演奏',
    '28': '聊天',
    '29': '玩家自办活动',
    '30': '迷宫挑战',
    '31': '讨伐歼灭战',
    '32': '玩家对战',
    '33': '随机任务',
    '34': '寻宝',
    '35': '特殊迷宫探索',
    '36': '特殊地图探索',
    '37': '青魔法师',
    '38': '开拓无人岛',
    '39': '制作',
    '41': '绝境战',
    '42': '深层迷宫挑战',
};

// source: /api/home/recruit/getJobConfigList
export const JOB = {
    '1': '防护职业',
    '3': '进攻职业',
    '5': '治疗职业',
    '6': '骑士',
    '7': '战士',
    '8': '暗黑骑士',
    '9': '绝枪战士',
    '10': '白魔法师',
    '11': '占星术士',
    '12': '学者',
    '13': '贤者',
    '14': '武僧',
    '15': '龙骑士',
    '16': '忍者',
    '17': '武士',
    '18': '钐镰客',
    '19': '吟游诗人',
    '20': '机工士',
    '21': '舞者',
    '22': '黑魔法师',
    '23': '召唤师',
    '24': '赤魔法师',
    '25': '青魔法师',
    '28': '近战职业',
    '29': '远程物理',
    '30': '远程魔法',
    '32': '任意职业',
    '33': '蝰蛇剑士',
    '34': '绘灵法师',
};

// source: /api/home/posts/partList type = 1
export const POST_PART = [
    {
        value: '34',
        label: '冒险者行会',
    },
    {
        value: '52',
        label: '生活杂谈',
    },
    {
        value: '38',
        label: '同人创作',
    },
    {
        value: '36',
        label: '剧情讨论',
    },
    {
        value: '51',
        label: '建议和BUG反馈',
    },
    {
        value: '37',
        label: '游戏记录',
    },
    {
        value: '35',
        label: '举手提问',
    },
    {
        value: '74',
        label: '版务专区',
    },
    {
        value: '75',
        label: '官方讯息',
    },
];

// source: /api/home/posts/partList type = 2
export const STRAT_PART = [
    {
        label: '新手指引',
        value: '1',
    },
    {
        label: '副本攻略',
        value: '2',
    },
    {
        label: '战斗职业',
        value: '3',
    },
    {
        label: 'PVP',
        value: '4',
    },
    {
        label: '生产采集',
        value: '5',
    },
    {
        label: '投影外观',
        value: '6',
    },
    {
        label: '房屋装修',
        value: '7',
    },
    {
        label: '骑士',
        value: '8',
    },
    {
        label: '武僧',
        value: '9',
    },
    {
        label: '战士',
        value: '10',
    },
    {
        label: '龙骑士',
        value: '11',
    },
    {
        label: '吟游诗人',
        value: '12',
    },
    {
        label: '白魔法师',
        value: '13',
    },
    {
        label: '黑魔法师',
        value: '14',
    },
    {
        label: '召唤师',
        value: '15',
    },
    {
        label: '学者',
        value: '16',
    },
    {
        label: '忍者',
        value: '17',
    },
    {
        label: '机工士',
        value: '18',
    },
    {
        label: '暗黑骑士',
        value: '19',
    },
    {
        label: '占星术士',
        value: '20',
    },
    {
        label: '武士',
        value: '21',
    },
    {
        label: '赤魔法师',
        value: '22',
    },
    {
        label: '青魔法师',
        value: '23',
    },
    {
        label: '绝枪战士',
        value: '24',
    },
    {
        label: '舞者',
        value: '25',
    },
    {
        label: '钐镰客',
        value: '26',
    },
    {
        label: '贤者',
        value: '27',
    },
    {
        label: '猫魅族',
        value: '28',
    },
    {
        label: '拉拉菲尔族',
        value: '29',
    },
    {
        label: '人族',
        value: '30',
    },
    {
        label: '精灵族',
        value: '31',
    },
    {
        label: '维埃拉族',
        value: '32',
    },
    {
        label: '敖龙族',
        value: '59',
    },
    {
        label: '硌狮族',
        value: '60',
    },
    {
        label: '鲁加族',
        value: '61',
    },
    {
        label: '无人岛',
        value: '62',
    },
    {
        label: '特殊场景探索',
        value: '63',
    },
    {
        label: '游戏资讯',
        value: '64',
    },
    {
        label: '内容考据',
        value: '65',
    },
    {
        label: '摄影截图',
        value: '66',
    },
    {
        label: '金碟游乐场',
        value: '67',
    },
    {
        label: '综合',
        value: '68',
    },
    {
        label: '其他',
        value: '69',
    },
    {
        label: '国际服资讯翻译',
        value: '70',
    },
    {
        label: '游戏资讯整理',
        value: '71',
    },
    {
        label: '其他',
        value: '72',
    },
];

export const POST_TYPE = {
    top: '置顶',
    refine: '精华',
    hot: '周热门',
};

export enum DynamicSource {
    General = 1,
    Post = 2,
    Strat = 3,
    NoviceNetwork = 5,
    Duty = 6,
    FreeCompany = 7,
    RolePlay = 8,
    Other = 9,
}

export enum NoviceNetworkIdentity {
    Mentor = 1,
    Sprout = 2,
}
