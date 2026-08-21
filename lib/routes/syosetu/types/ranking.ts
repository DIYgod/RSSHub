export enum RankingPeriod {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTER = 'quarter',
    YEARLY = 'yearly',
    TOTAL = 'total',
}

export enum NovelType {
    TOTAL = 'total',
    SHORT = 't',
    ONGOING = 'r',
    COMPLETE = 'er',
}

export enum RankingType {
    LIST = 'list',
    GENRE = 'genre',
    ISEKAI = 'isekai',
}

export const periodToOrder = {
    [RankingPeriod.DAILY]: 'dailypoint',
    [RankingPeriod.WEEKLY]: 'weeklypoint',
    [RankingPeriod.MONTHLY]: 'monthlypoint',
    [RankingPeriod.QUARTER]: 'quarterpoint',
    [RankingPeriod.YEARLY]: 'yearlypoint',
    [RankingPeriod.TOTAL]: 'hyoka',
} as const;

export const periodToPointField = {
    [RankingPeriod.DAILY]: 'pt',
    [RankingPeriod.WEEKLY]: 'weekly_point',
    [RankingPeriod.MONTHLY]: 'monthly_point',
    [RankingPeriod.QUARTER]: 'quarter_point',
    [RankingPeriod.YEARLY]: 'yearly_point',
    [RankingPeriod.TOTAL]: 'global_point',
} as const;

export const periodToJapanese = {
    [RankingPeriod.DAILY]: '日間',
    [RankingPeriod.WEEKLY]: '週間',
    [RankingPeriod.MONTHLY]: '月間',
    [RankingPeriod.QUARTER]: '四半期',
    [RankingPeriod.YEARLY]: '年間',
    [RankingPeriod.TOTAL]: '累計',
} as const;

export const novelTypeToJapanese = {
    [NovelType.TOTAL]: 'すべて',
    [NovelType.SHORT]: '短編',
    [NovelType.ONGOING]: '連載中',
    [NovelType.COMPLETE]: '完結済',
} as const;

export enum IsekaiCategory {
    RENAI = '1',
    FANTASY = '2',
    OTHER = 'o',
}

export const isekaiCategoryToJapanese = {
    [IsekaiCategory.RENAI]: '〔恋愛〕',
    [IsekaiCategory.FANTASY]: '〔ファンタジー〕',
    [IsekaiCategory.OTHER]: '〔文芸・SF・その他〕',
} as const;
