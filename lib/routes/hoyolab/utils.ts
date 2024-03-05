// @ts-nocheck
import got from '@/utils/got';

const getGameInfoList = (tryGet) =>
    tryGet('hoyolab:gameNameList', async () => {
        const { data } = await got('https://bbs-api-os-static.hoyolab.com/community/apihub/static/api/getAppConfig');
        return JSON.parse(data.data.config.hoyolab_game_info_list);
    });

const getI18nGameInfo = async (gid, language, tryGet) => {
    const gameNameList = await getGameInfoList(tryGet);
    const game = gameNameList.find((item) => item.game_id === Number.parseInt(gid, 10));
    return {
        name: game?.game_name_list.find((item) => item.locale === language)?.raw_name ?? game?.game_name_list.find((item) => item.locale === 'en-us')?.raw_name,
        icon: game?.game_icon,
    };
};

const getI18nType = (language, tryGet) =>
    tryGet(`hoyolab:type:${language}`, async () => {
        const { data } = await got(`https://webstatic.hoyoverse.com/admin/mi18n/bbs_oversea/m07281525151831/m07281525151831-${language}.json`);

        return {
            1: { title: data.official_notify, sort: 'notices' },
            2: { title: data.official_activity, sort: 'events' },
            3: { title: data.official_info, sort: 'news' },
        };
    });

module.exports = {
    getI18nGameInfo,
    getI18nType,
};
