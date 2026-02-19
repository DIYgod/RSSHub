// https://games.mobileapi.hupu.com/3/8.2.30/basketballapi/teamStandingList?offline=json&competitionLeagueType=nba&competitionType=nba&season=2025-2026&competitionStageType=REGULAR&client=EB5576BA-C415-43F7-850F-11B13E7991EB
import { result } from './response/teamStandingList.json';

const NBA_TEAMS = [...result.rankTypeListMap.E, ...result.rankTypeListMap.W];

const NBA_TEAM_NAMES: Record<string, string> = {
    活塞: 'Pistons',
    尼克斯: 'Knicks',
    猛龙: 'Raptors',
    热火: 'Heat',
    凯尔特人: 'Celtics',
    魔术: 'Magic',
    '76人': '76ers',
    骑士: 'Cavaliers',
    老鹰: 'Hawks',
    雄鹿: 'Bucks',
    公牛: 'Bulls',
    黄蜂: 'Hornets',
    篮网: 'Nets',
    步行者: 'Pacers',
    奇才: 'Wizards',
    雷霆: 'Thunder',
    湖人: 'Lakers',
    火箭: 'Rockets',
    马刺: 'Spurs',
    掘金: 'Nuggets',
    森林狼: 'Timberwolves',
    太阳: 'Suns',
    勇士: 'Warriors',
    灰熊: 'Grizzlies',
    开拓者: 'Trail Blazers',
    爵士: 'Jazz',
    独行侠: 'Mavericks',
    快船: 'Clippers',
    国王: 'Kings',
    鹈鹕: 'Pelicans',
};

export const NBA_TEAMS_ID_MAP = NBA_TEAMS.reduce(
    (map, team) => {
        const englishName = NBA_TEAM_NAMES[team.teamName];
        map[englishName.toLowerCase()] = team;
        return map;
    },
    {} as Record<string, (typeof NBA_TEAMS)[number] | undefined>
);
