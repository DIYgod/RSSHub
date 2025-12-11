export type Item = {
    AIGCDescription: string;
    CategoryType: number;
    author: {
        UserStoryStatus: number;
        avatarLarger: string;
        avatarMedium: string;
        avatarThumb: string;
        commentSetting: number;
        downloadSetting: number;
        duetSetting: number;
        ftc: boolean;
        id: string;
        isADVirtual: boolean;
        isEmbedBanned: boolean;
        nickname: string;
        openFavorite: boolean;
        privateAccount: boolean;
        relation: number;
        secUid: string;
        secret: boolean;
        signature: string;
        stitchSetting: number;
        uniqueId: string;
        verified: boolean;
    };
    authorStats: {
        diggCount: number;
        followerCount: number;
        followingCount: number;
        friendCount: number;
        heart: number;
        heartCount: number;
        videoCount: number;
    };
    authorStatsV2: {
        diggCount: string;
        followerCount: string;
        followingCount: string;
        friendCount: string;
        heart: string;
        heartCount: string;
        videoCount: string;
    };
    backendSourceEventTracking: string;
    collected: boolean;
    createTime: number;
    creatorAIComment: {
        eligibleVideo: boolean;
        hasAITopic: boolean;
        notEligibleReason: number;
    };
    desc: string;
    digged: boolean;
    duetDisplay: number;
    duetEnabled: boolean;
    forFriend: boolean;
    id: string;
    isAd: boolean;
    isReviewing: boolean;
    itemCommentStatus: number;
    item_control: {
        can_repost: boolean;
        can_comment?: boolean;
        can_creator_redirect?: boolean;
        can_music_redirect?: boolean;
        can_share?: boolean;
    };
    music: {
        authorName: string;
        coverLarge: string;
        coverMedium: string;
        coverThumb: string;
        duration: number;
        id: string;
        isCopyrighted: boolean;
        is_commerce_music: boolean;
        is_unlimited_music: boolean;
        original: boolean;
        playUrl: string;
        private: boolean;
        shoot_duration: number;
        title: string;
        tt2dsp: {
            tt_to_dsp_song_infos: {
                meta_song_id: string;
                platform: number;
                song_id: string;
                token: {
                    apple_music_token: {
                        developer_token: string;
                    };
                };
            }[];
        };
    };
    officalItem: boolean; // Not a typo for "officialItem"
    originalItem: boolean;
    privateItem: boolean;
    secret: boolean;
    shareEnabled: boolean;
    stats: {
        collectCount: number;
        commentCount: number;
        diggCount: number;
        playCount: number;
        shareCount: number;
    };
    statsV2: {
        collectCount: string;
        commentCount: string;
        diggCount: string;
        playCount: string;
        repostCount: string;
        shareCount: string;
    };
    stitchDisplay: number;
    stitchEnabled: boolean;
    textLanguage: string;
    textTranslatable: boolean;
    video: {
        PlayAddrStruct: {
            DataSize: number;
            FileCs: string;
            FileHash: string;
            Height: number;
            Uri: string;
            UrlKey: string;
            UrlList: string[];
            Width: number;
        };
        VQScore: string;
        bitrate: number;
        bitrateInfo: {
            Bitrate: number;
            BitrateFPS: number;
            CodecType: string;
            Format: string;
            GearName: string;
            MVMAF: string;
            PlayAddr: {
                DataSize: number;
                FileCs: string;
                FileHash: string;
                Height: number;
                Uri: string;
                UrlKey: string;
                UrlList: string[];
                Width: number;
            };
            QualityType: number;
            VideoExtra: string;
        }[];
        claInfo: {
            enableAutoCaption: boolean;
            hasOriginalAudio: boolean;
            noCaptionReason?: number;
            captionInfos?: {
                captionFormat: string;
                claSubtitleID: string;
                expire: string;
                isAutoGen: boolean;
                isOriginalCaption: boolean;
                language: string;
                languageCode: string;
                languageID: string;
                subID: string;
                subtitleType: string;
                translationType: string;
                url: string;
                urlList: string[];
                variant: string;
            }[];
            captionsType?: number;
            originalLanguageInfo?: {
                canTranslateRealTimeNoCheck: boolean;
                language: string;
                languageCode: string;
                languageID: string;
            };
        };
        codecType: string;
        cover: string;
        definition: string;
        downloadAddr: string;
        duration: number;
        dynamicCover: string;
        encodeUserTag: string;
        encodedType: string;
        format: string;
        height: number;
        id: string;
        originCover: string;
        playAddr: string;
        ratio: string;
        size: number;
        videoID: string;
        videoQuality: string;
        volumeInfo: {
            Loudness: number;
            Peak: number;
        };
        width: number;
        zoomCover: {
            240: string;
            480: string;
            720: string;
            960: string;
        };
        subtitleInfos?: {
            Format: string;
            LanguageCodeName: string;
            LanguageID: string;
            Size: number;
            Source: string;
            Url: string;
            UrlExpire: number;
            Version: string;
        }[];
    };
    challenges?: {
        coverLarger: string;
        coverMedium: string;
        coverThumb: string;
        desc: string;
        id: string;
        profileLarger: string;
        profileMedium: string;
        profileThumb: string;
        title: string;
    }[];
    textExtra?: Array<{
        awemeId: string;
        end: number;
        hashtagName: string;
        isCommerce: boolean;
        start: number;
        subType: number;
        type: number;
        secUid?: string;
        userId?: string;
        userUniqueId?: string;
    }>;
    videoSuggestWordsList?: {
        video_suggest_words_struct: {
            hint_text: string;
            scene: string;
            words: Array<{
                word: string;
                word_id: string;
            }>;
        }[];
    };
    diversificationId?: number;
    contents?: {
        desc: string;
        textExtra?: {
            awemeId: string;
            end: number;
            hashtagName: string;
            isCommerce: boolean;
            start: number;
            subType: number;
            type: number;
            secUid?: string;
            userId?: string;
            userUniqueId?: string;
        }[];
    }[];
    BAInfo?: string;
    adAuthorization?: boolean;
    adLabelVersion?: number;
};
