export enum SyosetuSub {
    YOMOU = 'yomou',
    NOCTURNE = 'noc',
    MOONLIGHT = 'mnlt',
    MIDNIGHT = 'mid',
}

export const syosetuSubToJapanese = {
    [SyosetuSub.YOMOU]: '小説を読もう',
    [SyosetuSub.NOCTURNE]: 'ノクターン',
    [SyosetuSub.MOONLIGHT]: 'ムーンライト',
    [SyosetuSub.MIDNIGHT]: 'ミッドナイト',
} as const;

export interface NarouSearchParams {
    /**
     * 作品種別の絞り込み Work Type Filter
     *
     * t 短編 Short
     * r 連載中 Ongoing Series
     * er 完結済連載作品 Completed Series
     * re すべての連載作品 (連載中および完結済) Series and Completed Series
     * ter 短編と完結済連載作品 Completed Works (Including Short and Series)
     *
     * tr 短編と連載中小説 Short and Ongoing Series
     * all 全ての種別 (Default) All Types
     *
     * Note: While the official documentation describes 5 values, all 7 values above are functional.
     */
    type?: 't' | 'r' | 'er' | 're' | 'ter' | 'tr' | 'all';

    /** 検索ワード Search Keywords */
    word?: string;

    /** 除外ワード Excluded Keywords */
    notword?: string;

    /**
     * 検索範囲指定 Search Range Specifications
     *
     * - 読了時間 Reading Time
     * - 文字数 Character Count
     * - 総合ポイント Total Points
     * - 最新掲載日（年月日）Latest Update Date (Year/Month/Day)
     * - 初回掲載日（年月日）First Publication Date (Year/Month/Day)
     */
    mintime?: number;
    maxtime?: number;
    minlen?: number;
    maxlen?: number;
    min_globalpoint?: number;
    max_globalpoint?: number;
    minlastup?: string;
    maxlastup?: string;
    minfirstup?: string;
    maxfirstup?: string;

    /**
     * 抽出条件の指定 Extraction Conditions
     *
     * - 挿絵のある作品 Works with Illustrations
     * - 小説 PickUp！対象作品 Featured Novels
     *
     * 作品に含まれる要素：Elements Included in Works:
     * - 残酷な描写あり Contains Cruel Content
     * - ボーイズラブ Boys' Love
     * - ガールズラブ Girls' Love
     * - 異世界転生 Reincarnation in Another World
     * - 異世界転移 Transportation to Another World
     */
    sasie?: string;
    ispickup?: boolean;
    iszankoku?: boolean;
    isbl?: boolean;
    isgl?: boolean;
    istensei?: boolean;
    istenni?: boolean;

    /**
     * 除外条件の指定 Exclusion Conditions
     *
     * - 長期連載停止中の作品 Works on Long-term Hiatus
     *
     * 作品に含まれる要素：Elements to Exclude:
     * - 残酷な描写あり Cruel Content
     * - ボーイズラブ Boys' Love
     * - ガールズラブ Girls' Love
     * - 異世界転生 Reincarnation in Another World
     * - 異世界転移 Transportation to Another World
     */
    stop?: boolean;
    notzankoku?: boolean;
    notbl?: boolean;
    notgl?: boolean;
    nottensei?: boolean;
    nottenni?: boolean;

    /**
     * ワード検索範囲指定 Word Search Scope
     * すべてのチェックを解除した場合、すべての項目がワード検索の対象となります。
     * If all boxes are unchecked, all items will become targets for word search.
     *
     * 作品タイトル Work Title
     * あらすじ Synopsis
     * キーワード Keywords
     * 作者名 Author Name
     */
    title?: boolean;
    ex?: boolean;
    keyword?: boolean;
    wname?: boolean;

    /**
     * 並び順 Sort Order
     * - new: 新着更新順 (Default) Latest Updates
     * - weekly: 週間ユニークアクセスが多い順 Most Weekly Unique Access
     * - favnovelcnt: ブックマーク登録の多い順 Most Bookmarks
     * - reviewcnt: レビューの多い順 Most Reviews
     * - hyoka: 総合ポイントの高い順 Highest Total Points
     * - dailypoint: 日間ポイントの高い順 Highest Daily Points
     * - weeklypoint: 週間ポイントの高い順 Highest Weekly Points
     * - monthlypoint: 月間ポイントの高い順 Highest Monthly Points
     * - quarterpoint: 四半期ポイントの高い順 Highest Quarterly Points
     * - yearlypoint: 年間ポイントの高い順 Highest Yearly Points
     * - hyokacnt: 評価者数の多い順 Most Ratings
     * - lengthdesc: 文字数の多い順 Most Characters
     * - generalfirstup: 初回掲載順 First Publication Order
     * - ncodedesc: N コード降順 Ncode Descending
     * - old: 更新が古い順 Oldest Updates
     */
    order?: 'new' | 'weekly' | 'favnovelcnt' | 'reviewcnt' | 'hyoka' | 'dailypoint' | 'weeklypoint' | 'monthlypoint' | 'quarterpoint' | 'yearlypoint' | 'hyokacnt' | 'lengthdesc' | 'generalfirstup' | 'ncodedesc' | 'old';

    /** ジャンル Genre */
    genre?: string;

    /** 掲載サイト指定 Site */
    nocgenre?: number;
}
