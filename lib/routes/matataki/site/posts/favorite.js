const matatakiUtils = require('@/routes/matataki/utils/matataki-utils');

module.exports = async (ctx) => {
    const userId = ctx.params.userId;
    const favoriteListId = ctx.params.favoriteListId;
    const ipfsFlag = !!ctx.params.ipfsFlag;

    const response = await matatakiUtils.get(`/favorites/post?userId=${userId}&fid=${favoriteListId}&page=1`);
    let items;

    if (ipfsFlag) {
        items = await Promise.all(
            response.data.data.list.map(async (item) => {
                const ipfsHtmlHash = await matatakiUtils.getPostIpfsHtmlHash(item.pid);

                return {
                    title: item.title,
                    description: item.short_content,
                    link: `${matatakiUtils.IPFS_GATEWAY_URL}/ipfs/${ipfsHtmlHash}`,
                    pubDate: item.create_time,
                    guid: ipfsHtmlHash,
                };
            })
        );
    } else {
        items = response.data.data.list.map((item) => ({
            title: item.title,
            description: item.short_content,
            link: `https://www.matataki.io/p/${item.pid}`,
            pubDate: item.create_time,
        }));
    }

    const text = `瞬Matataki - ${response.data.data.info.nickname || response.data.data.info.username} 收藏夹 #${response.data.data.info.name}# ${ipfsFlag ? '(IPFS)' : ''}`;
    ctx.state.data = {
        title: text,
        link: `https://www.matataki.io/user/${userId}/favlist?fid=${favoriteListId}`,
        description: text,
        allowEmpty: true,
        item: items,
    };
};
