import {
    RssFeed,
    CollectibleApproval,
    CollectibleBurn,
    CollectibleMint,
    CollectibleTrade,
    CollectibleTransfer,
    MetaverseBurn,
    MetaverseMint,
    MetaverseTrade,
    MetaverseTransfer,
    SocialComment,
    SocialDelete,
    SocialMint,
    SocialPost,
    SocialProfile,
    SocialProxy,
    SocialRevise,
    SocialReward,
    SocialShare,
    StakeStaking,
    StakeTransaction,
    StakerProfitSnapshot,
    TransactionApproval,
    TransactionBridge,
    TransactionBurn,
    TransactionEvent,
    TransactionMint,
    TransactionTransfer,
} from '@rss3/sdk';
export type RSS3DataModels = {
    RssFeed: RssFeed;
    CollectibleApproval: CollectibleApproval;
    CollectibleBurn: CollectibleBurn;
    CollectibleMint: CollectibleMint;
    CollectibleTrade: CollectibleTrade;
    CollectibleTransfer: CollectibleTransfer;
    MetaverseBurn: MetaverseBurn;
    MetaverseMint: MetaverseMint;
    MetaverseTrade: MetaverseTrade;
    MetaverseTransfer: MetaverseTransfer;
    SocialComment: SocialComment;
    SocialDelete: SocialDelete;
    SocialMint: SocialMint;
    SocialPost: SocialPost;
    SocialProfile: SocialProfile;
    SocialProxy: SocialProxy;
    SocialRevise: SocialRevise;
    SocialReward: SocialReward;
    SocialShare: SocialShare;
    StakeStaking: StakeStaking;
    StakeTransaction: StakeTransaction;
    StakerProfitSnapshot: StakerProfitSnapshot;
    TransactionApproval: TransactionApproval;
    TransactionBridge: TransactionBridge;
    TransactionBurn: TransactionBurn;
    TransactionEvent: TransactionEvent;
    TransactionMint: TransactionMint;
    TransactionTransfer: TransactionTransfer;
};
export type GetRSS3DataMetadata<FirstKey extends string, SecondKey extends string> = `${Capitalize<FirstKey>}${Capitalize<SecondKey>}` extends keyof RSS3DataModels
    ? RSS3DataModels[`${Capitalize<FirstKey>}${Capitalize<SecondKey>}`]
    : null;
