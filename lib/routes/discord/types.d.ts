interface Application {
    link: string;
    id: string;
    name: string;
}

interface Assets {
    hero: string;
    hero_video: string | null;
    quest_bar_hero: string;
    quest_bar_hero_video: string | null;
    game_tile: string;
    logotype: string;
    game_tile_light: string;
    game_tile_dark: string;
    logotype_light: string;
    logotype_dark: string;
}

interface Colors {
    primary: string;
    secondary: string;
}

interface Messages {
    quest_name: string;
    game_title: string;
    game_publisher: string;
}

interface TaskEvent {
    event_name: string;
    target: number;
    external_ids: string[];
}

interface TaskEventNoExternalIds {
    event_name: string;
    target: number;
    external_ids: never[];
}

interface TaskConfig {
    type: number;
    join_operator: string;
    tasks: {
        PLAY_ON_XBOX?: TaskEvent;
        PLAY_ON_DESKTOP?: TaskEventNoExternalIds;
        PLAY_ON_PLAYSTATION?: TaskEvent;
        WATCH_VIDEO_ON_MOBILE?: TaskEventNoExternalIds;
        WATCH_VIDEO?: TaskEventNoExternalIds;
    };
}

interface ApplicationRef {
    id: string;
}

interface TaskV2Base {
    type: string;
    target: number;
}

interface PlayTask extends TaskV2Base {
    applications: ApplicationRef[];
    external_ids?: string[];
}

interface VideoAsset {
    url: string;
    width: number;
    height: number;
    thumbnail: string;
    caption?: string;
    transcript?: string;
}

interface VideoTaskAssets {
    video: VideoAsset;
    video_low_res: VideoAsset;
    video_hls: VideoAsset;
}

interface VideoTaskMessages {
    video_title: string;
    video_end_cta_title?: string;
    video_end_cta_subtitle?: string;
    video_end_cta_button_label?: string;
}

interface WatchVideoTask extends TaskV2Base {
    assets: VideoTaskAssets;
    messages: VideoTaskMessages;
}

interface TaskConfigV2 {
    tasks: {
        PLAY_ON_XBOX?: PlayTask;
        PLAY_ON_DESKTOP?: PlayTask;
        PLAY_ON_PLAYSTATION?: PlayTask;
        WATCH_VIDEO_ON_MOBILE?: WatchVideoTask;
        WATCH_VIDEO?: WatchVideoTask;
    };
    join_operator: string;
}

interface RewardMessages {
    name: string;
    name_with_article: string;
    redemption_instructions_by_platform: {
        '0': string;
    };
}

interface Reward {
    type: number;
    sku_id: string;
    messages: RewardMessages;
    orb_quantity?: number;
    asset?: string;
    asset_video?: null;
    approximate_count?: null;
    redemption_link?: null;
    expires_at?: string;
    expires_at_premium?: null;
    expiration_mode?: number;
}

interface RewardsConfig {
    assignment_method: number;
    rewards: Reward[];
    rewards_expire_at: string;
    platforms: number[];
}

interface CTAConfig {
    link: string;
    button_label: string;
    android?: {
        android_app_id: string;
    };
    ios?: {
        ios_app_id: string;
    };
    subtitle?: string;
}

interface VideoMetadataMessages {
    video_title: string;
    video_end_cta_button_label: string;
    video_end_cta_title?: string;
    video_end_cta_subtitle?: string;
}

interface VideoMetadataAssets {
    video_player_video_hls: string;
    video_player_video: string;
    video_player_thumbnail: string;
    video_player_video_low_res: string;
    video_player_caption: string | null;
    video_player_transcript: string | null;
    quest_bar_preview_video: null;
    quest_bar_preview_thumbnail: null;
    quest_home_video: null;
}

interface VideoMetadata {
    messages: VideoMetadataMessages;
    assets: VideoMetadataAssets;
}

interface QuestConfig {
    id: string;
    config_version: number;
    starts_at: string;
    expires_at: string;
    features: number[];
    application: Application;
    assets: Assets;
    colors: Colors;
    messages: Messages;
    task_config: TaskConfig;
    task_config_v2: TaskConfigV2;
    rewards_config: RewardsConfig;
    share_policy: string;
    cta_config: CTAConfig;
    video_metadata?: VideoMetadata;
}

interface ProgressHeartbeat {
    last_beat_at: string;
    expires_at: null;
}

interface ProgressTask {
    value: number;
    event_name: string;
    updated_at: string;
    completed_at: string;
    heartbeat: ProgressHeartbeat | null;
}

interface UserProgress {
    PLAY_ON_DESKTOP?: ProgressTask;
    PLAY_ON_XBOX?: ProgressTask;
    PLAY_ON_PLAYSTATION?: ProgressTask;
    WATCH_VIDEO_ON_MOBILE?: ProgressTask;
    WATCH_VIDEO?: ProgressTask;
}

interface UserStatus {
    user_id: string;
    quest_id: string;
    enrolled_at: string;
    completed_at: string;
    claimed_at: string;
    claimed_tier: null;
    last_stream_heartbeat_at: null;
    stream_progress_seconds: number;
    dismissed_quest_content: number;
    progress: UserProgress;
}

interface Quest {
    id: string;
    config: QuestConfig;
    user_status: UserStatus | null;
    targeted_content: never[];
    preview: boolean;
    traffic_metadata_raw: string;
    traffic_metadata_sealed: string;
}

export interface QuestResponse {
    quests: Quest[];
}
