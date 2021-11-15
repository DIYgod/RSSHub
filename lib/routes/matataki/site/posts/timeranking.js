import matatakiUtils from '~/routes/matataki/utils/matataki-utils';

export default async (ctx) => {
    const {
        querystring
    } = ctx.request;
    const ipfsFlag = !!ctx.params.ipfsFlag;

    const items = await matatakiUtils.getPostsAsFeedItems(`/posts/timeRanking?${querystring}`, ipfsFlag);

    ctx.state.data = {
        title: `瞬Matataki - 最新作品 ${ipfsFlag ? '(IPFS)' : ''}`,
        link: `https://www.matataki.io/article/latest`,
        description: `瞬Matataki - 最新作品`,
        item: items,
    };
};
