// @ts-nocheck
import got from '@/utils/got';

export default async (ctx) => {
    const url = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';

    const response = await got({
        method: 'get',
        url,
    });

    const typeMap = {
        release: '正式版',
        snapshot: '快照',
        old_alpha: '过时的预览版',
        old_beta: '过时的测试版',
    };

    const data = response.data.versions;

    const title = `Minecraft Java版游戏更新`;

    ctx.set('data', {
        title,
        link: `https://www.minecraft.net/`,
        description: title,
        item: data.map((item) => ({
            title: `${item.id} ${typeMap[item.type] || ''}更新`,
            description: `${item.id} ${typeMap[item.type] || ''}更新`,
            pubDate: new Date(item.releaseTime).toUTCString(),
            link: `https://www.minecraft.net`,
            guid: item.id + item.type,
        })),
    });
};
