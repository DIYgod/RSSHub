import { R18Site } from 'narou';

export enum SyosetuSub {
    NOCTURNE = 'noc',
    MOONLIGHT = 'mnlt',
    MIDNIGHT = 'mid',
    MOONLIGHT_BL = 'mnlt-bl',
}

export enum RankingPeriod {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTER = 'quarter',
    YEARLY = 'yearly',
}

export enum NovelType {
    TOTAL = 'total',
    SHORT = 't',
    ONGOING = 'r',
    COMPLETE = 'er',
}

export const syosetuSubToNocgenre = {
    [SyosetuSub.NOCTURNE]: R18Site.Nocturne,
    [SyosetuSub.MOONLIGHT]: R18Site.MoonLight,
    [SyosetuSub.MOONLIGHT_BL]: R18Site.MoonLightBL,
    [SyosetuSub.MIDNIGHT]: R18Site.Midnight,
} as const;

export const syosetuSubToJapanese = {
    [SyosetuSub.NOCTURNE]: 'ノクターン',
    [SyosetuSub.MOONLIGHT]: 'ムーンライト',
    [SyosetuSub.MOONLIGHT_BL]: 'ムーンライト BL',
    [SyosetuSub.MIDNIGHT]: 'ミッドナイト',
} as const;

export const periodToOrder = {
    [RankingPeriod.DAILY]: 'dailypoint',
    [RankingPeriod.WEEKLY]: 'weeklypoint',
    [RankingPeriod.MONTHLY]: 'monthlypoint',
    [RankingPeriod.QUARTER]: 'quarterpoint',
    [RankingPeriod.YEARLY]: 'yearlypoint',
} as const;

export const periodToJapanese = {
    [RankingPeriod.DAILY]: '日間',
    [RankingPeriod.WEEKLY]: '週間',
    [RankingPeriod.MONTHLY]: '月間',
    [RankingPeriod.QUARTER]: '四半期',
    [RankingPeriod.YEARLY]: '年間',
} as const;

export const novelTypeToJapanese = {
    [NovelType.TOTAL]: '総合',
    [NovelType.SHORT]: '短編',
    [NovelType.ONGOING]: '連載中',
    [NovelType.COMPLETE]: '完結済',
} as const;
