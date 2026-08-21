interface AvatarThumb {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
}

interface ShareInfo {
    share_url: string;
    share_weibo_desc: string;
    share_desc: string;
    share_title: string;
    share_qrcode_url: AvatarThumb;
    share_title_myself: string;
    share_title_other: string;
    share_desc_info: string;
    share_link_desc: string;
}

interface Author {
    uid: string;
    ban_user_functions: null;
    nickname: string;
    cf_list: null;
    link_item_list: null;
    avatar_thumb: AvatarThumb;
    avatar_schema_list: null;
    signature_extra: null;
    follow_status: number;
    risk_notice_text: string;
    private_relation_list: null;
    follower_list_secondary_information_struct: null;
    custom_verify: string;
    can_set_geofencing: null;
    batch_unfollow_contain_tabs: null;
    display_info: null;
    verification_permission_ids: null;
    need_points: null;
    share_info: ShareInfo;
    familiar_visitor_user: null;
    homepage_bottom_toast: null;
    batch_unfollow_relation_desc: null;
    enterprise_verify_reason: string;
    is_ad_fake: boolean;
    account_cert_info: string;
    card_entries_not_display: null;
    user_tags: null;
    profile_mob_params: null;
    card_sort_priority: null;
    not_seen_item_id_list: null;
    card_entries: null;
    prevent_download: boolean;
    text_extra: null;
    sec_uid: string;
    im_role_ids: null;
    follower_status: number;
    not_seen_item_id_list_v2: null;
    contrail_list: null;
    data_label_list: null;
    cover_url: AvatarThumb[];
    user_permissions: null;
    offline_info_list: null;
    endorsement_info_list: null;
    interest_tags: null;
    personal_tag_list: null;
    white_cover_url: null;
    creator_tag_list: null;
    special_people_labels: null;
}

interface CoverHd {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
}

interface CoverLarge {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
}

interface CoverMedium {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
}

interface CoverThumb {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
}

interface PlayUrl {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
    url_key: string;
}

interface SearchImpr {
    entity_id: string;
}

interface Chorus {
    start_ms: number;
    duration_ms: number;
}

interface Song {
    id: number;
    id_str: string;
    title: string;
    artists: null;
    chorus: Chorus;
    chorus_v3_infos: null;
}

interface MusicImageBeatsUrl {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
}

interface MusicImageBeats {
    music_image_beats_url: MusicImageBeatsUrl;
    music_image_beats_raw: string;
}

interface CoverColorHsv {
    h: number;
    s: number;
    v: number;
}

interface StrongBeatUrl {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
}

interface Music {
    id: number;
    id_str: string;
    title: string;
    author: string;
    album: string;
    cover_hd: CoverHd;
    cover_large: CoverLarge;
    cover_medium: CoverMedium;
    cover_thumb: CoverThumb;
    play_url: PlayUrl;
    schema_url: string;
    source_platform: number;
    start_time: number;
    end_time: number;
    duration: number;
    extra: string;
    user_count: number;
    position: null;
    collect_stat: number;
    status: number;
    offline_desc: string;
    owner_nickname: string;
    is_original: boolean;
    mid: string;
    binded_challenge_id: number;
    redirect: boolean;
    is_restricted: boolean;
    author_deleted: boolean;
    is_del_video: boolean;
    is_video_self_see: boolean;
    owner_handle: string;
    author_position: null;
    prevent_download: boolean;
    unshelve_countries: null;
    prevent_item_download_status: number;
    external_song_info: Array<false>;
    preview_start_time: number;
    preview_end_time: number;
    is_commerce_music: boolean;
    is_original_sound: boolean;
    audition_duration: number;
    shoot_duration: number;
    reason_type: number;
    artists: Array<false>;
    lyric_short_position: null;
    mute_share: boolean;
    tag_list: null;
    dmv_auto_show: boolean;
    is_pgc: boolean;
    is_matched_metadata: boolean;
    is_audio_url_with_cookie: boolean;
    music_chart_ranks: null;
    can_background_play: boolean;
    music_status: number;
    video_duration: number;
    pgc_music_type: number;
    search_impr: SearchImpr;
    artist_user_infos: null;
    dsp_status: number;
    musician_user_infos: null;
    music_collect_count: number;
    music_cover_atmosphere_color_value: string;
    strong_beat_url: StrongBeatUrl;
    cover_color_hsv: CoverColorHsv;
    song: Song;
    music_image_beats: MusicImageBeats;
    owner_id: string;
    sec_uid: string;
    avatar_thumb: AvatarThumb;
    avatar_medium: AvatarThumb;
    avatar_large: AvatarThumb;
    author_status: number;
}

interface PlayAddr {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
    url_key: string;
    data_size: number;
    file_hash: string;
    file_cs: string;
}

interface Cover {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
}

interface DynamicCover {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
}

interface OriginCover {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
}

interface UrlList {
    main_url: string;
    backup_url: string;
    fallback_url: string;
}

interface AudioMeta {
    url_list: UrlList;
    encoded_type: string;
    media_type: string;
    logo_type: string;
    quality: string;
    quality_desc: string;
    format: string;
    bitrate: number;
    codec_type: string;
    size: number;
    fps: number;
    file_id: string;
    file_hash: string;
    sub_info: string;
}

interface BitRateAudio {
    audio_meta: AudioMeta;
    audio_quality: number;
    audio_extra: string;
}

interface PlayAddrH264 {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
    url_key: string;
    data_size: number;
    file_hash: string;
    file_cs: string;
}

interface AnimatedCover {
    uri: string;
    url_list: string[];
}

type OriginalSoundInfos = unknown;

interface Audio {
    original_sound_infos: OriginalSoundInfos;
}

interface BigThumbs {
    img_num: number;
    uri: string;
    img_url: string;
    img_x_size: number;
    img_y_size: number;
    img_x_len: number;
    img_y_len: number;
    duration: number;
    interval: number;
    fext: string;
    uris: string[];
    img_urls: string[];
}

interface BitRate {
    gear_name: string;
    quality_type: number;
    bit_rate: number;
    play_addr: PlayAddr;
    is_h265: number;
    is_bytevc1: number;
    HDR_type: string;
    HDR_bit: string;
    FPS: number;
    video_extra: string;
    format: string;
}

interface GaussianCover {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
}

interface PlayAddr265 {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
    url_key: string;
    data_size: number;
    file_hash: string;
    file_cs: string;
}

interface Video {
    play_addr: PlayAddr;
    cover: Cover;
    height: number;
    width: number;
    dynamic_cover: DynamicCover;
    origin_cover: OriginCover;
    ratio: string;
    bit_rate_audio: BitRateAudio[] | null;
    is_source_HDR: number;
    bit_rate: BitRate[];
    duration: number;
    gaussian_cover: GaussianCover;
    play_addr_h264: PlayAddrH264;
    format: string;
    animated_cover: AnimatedCover;
    audio: Audio;
    meta: string;
    video_model: string;
    big_thumbs: BigThumbs[];
    use_static_cover: boolean;
    play_addr_265: PlayAddr265;
}

interface GameTagInfo {
    is_game: boolean;
}

interface Statistics {
    admire_count: number;
    comment_count: number;
    digg_count: number;
    collect_count: number;
    play_count: number;
    share_count: number;
}

interface ReviewResult {
    review_status: number;
}

interface Status {
    listen_video_status: number;
    is_delete: boolean;
    allow_share: boolean;
    is_prohibited: boolean;
    in_reviewing: boolean;
    part_see: number;
    private_status: number;
    review_result: ReviewResult;
}

interface DistributeCircle {
    distribute_type: number;
    campus_block_interaction: boolean;
    is_campus: boolean;
}

interface TextExtra {
    start: number;
    end: number;
    type: number;
    hashtag_name: string;
    hashtag_id: string;
    is_commerce: boolean;
    caption_start: number;
    caption_end: number;
    search_text: string;
    search_query_id: string;
}

interface RiskInfos {
    vote: boolean;
    warn: boolean;
    risk_sink: boolean;
    type: number;
    content: string;
}

interface PublishPlusAlienation {
    alienation_type: number;
}

interface XiguaBaseInfo {
    status: number;
    star_altar_order_id: number;
    star_altar_type: number;
    item_id: number;
}

interface LogPb {
    impr_id: string;
}

interface SuggestWords {
    suggest_words: Array<{
        words: Array<{
            word: string;
            word_id: string;
            info: string;
        }>;
        scene: string;
        icon_url: string;
        hint_text: string;
    }>;
}

interface CommentPermissionInfo {
    comment_permission_status: number;
    can_comment: boolean;
    item_detail_entry: boolean;
    press_entry: boolean;
    toast_guide: boolean;
}

interface SeriesPaidInfo {
    series_paid_status: number;
    item_price: number;
}

interface ImageAlbumMusicInfo {
    begin_time: number;
    end_time: number;
    volume: number;
}

interface VideoTag {
    tag_id: number;
    tag_name: string;
    level: number;
}

interface PhotoSearchEntrance {
    ecom_type: number;
}

interface DanmakuControl {
    enable_danmaku: boolean;
    post_privilege_level: number;
    is_post_denied: boolean;
    post_denied_reason: string;
    skip_danmaku: boolean;
    danmaku_cnt: number;
    activities: null;
    pass_through_params: string;
}

interface ItemWarnNotification {
    type: number;
    show: boolean;
    content: string;
}

interface VideoControl {
    allow_download: boolean;
    share_type: number;
    show_progress_bar: number;
    draft_progress_bar: number;
    allow_duet: boolean;
    allow_react: boolean;
    prevent_download_type: number;
    allow_dynamic_wallpaper: boolean;
    timer_status: number;
    allow_music: boolean;
    allow_stitch: boolean;
    allow_douplus: boolean;
    allow_share: boolean;
    share_grayed: boolean;
    download_ignore_visibility: boolean;
    duet_ignore_visibility: boolean;
    share_ignore_visibility: boolean;
    download_info: {
        level: number;
        fail_info: {
            code: number;
            reason: string;
            msg: string;
        };
    };
    duet_info: {
        level: number;
        fail_info: {
            code: number;
            reason: string;
        };
    };
    allow_record: boolean;
    disable_record_reason: string;
    timer_info: object;
}

interface AwemeControl {
    can_forward: boolean;
    can_share: boolean;
    can_comment: boolean;
    can_show_comment: boolean;
}

interface LifeAnchorShowExtra {
    anchor_type: number;
    should_show: boolean;
    has_anchor_info: boolean;
    extra: string;
}

interface Icon {
    uri: string;
    url_list: string[];
    width: number;
    height: number;
    url_key: string;
}

interface StyleInfo {
    default_icon: string;
    scene_icon: string;
    extra: string;
}

interface AnchorInfo {
    type: number;
    id: string;
    icon: Icon;
    title: string;
    title_tag: string;
    content: string;
    style_info: StyleInfo;
    extra: string;
    log_extra: string;
    web_url: string;
    mp_url: string;
    open_url: string;
}

interface AncestorInfo {
    product_id: number;
    gid: number;
    uid: number;
}

interface VtagSearch {
    vtag_enable: boolean;
    vtag_delay_ts: number;
}

interface HotList {
    title: string;
    image_url: string;
    schema: string;
    type: number;
    i18n_title: string;
    header: string;
    footer: string;
    pattern_type: number;
    rank: number;
    hot_score: number;
    view_count: number;
    group_id: string;
    sentence: string;
    sentence_id: number;
    extra: string;
}

interface StarAtlasInfo {
    log_extra: string;
    click_track_url_list: null;
    track_url_list: null;
}

interface SharePostInfo {
    share_type: string;
    is_open_platform: number;
    open_platform_key: string;
}

interface Aweme {
    aweme_id: string;
    desc: string;
    create_time: number;
    author: Author;
    music: Music;
    mv_info: null;
    video: Video;
    game_tag_info: GameTagInfo;
    user_digged: number;
    statistics: Statistics;
    status: Status;
    distribute_circle: DistributeCircle;
    text_extra: TextExtra[];
    is_top: number;
    reply_smart_emojis: null;
    share_info: ShareInfo;
    flash_mob_trends: number;
    video_labels: null;
    item_title: string;
    is_ads: boolean;
    duration: number;
    aweme_type: number;
    is_24_story: number;
    origin_duet_resource_uri: string;
    image_infos: null;
    risk_infos: RiskInfos;
    is_use_music: boolean;
    dislike_dimension_list_v2: null;
    position: null;
    uniqid_position: null;
    comment_list: null;
    author_user_id: number;
    publish_plus_alienation: PublishPlusAlienation;
    geofencing: Array<false>;
    enable_comment_sticker_rec: boolean;
    xigua_base_info: XiguaBaseInfo;
    region: string;
    video_text: null;
    ref_voice_modify_id_list: null;
    collect_stat: number;
    label_top_text: null;
    promotions: Array<false>;
    group_id: string;
    prevent_download: boolean;
    nickname_position: null;
    challenge_position: null;
    caption: string;
    voice_modify_id_list: null;
    tts_id_list: null;
    long_video: null;
    entertainment_product_info: {
        sub_title: null;
        market_info: {
            limit_free: {
                in_free: boolean;
            };
            marketing_tag: null;
        };
    };
    create_scale_type: string[] | null;
    ref_tts_id_list: null;
    personal_page_botton_diagnose_style: number;
    interaction_stickers: null;
    media_type: number;
    origin_comment_ids: null;
    commerce_config_data: null;
    chapter_bar_color: null;
    video_control: VideoControl;
    aweme_control: AwemeControl;
    trends_infos: null;
    aweme_type_tags: string;
    slides_music_beats: null;
    original: number;
    anchors: null;
    hybrid_label: null;
    geofencing_regions: null;
    friend_interaction: number;
    image_crop_ctrl: number;
    is_story: number;
    activity_video_type: number;
    video_game_data_channel_config: object;
    can_cache_to_local: boolean;
    cover_labels: null;
    video_share_edit_status: number;
    jump_tab_info_list: null;
    guide_btn_type: number;
    friend_recommend_info: object;
    yumme_recreason: null;
    images: null;
    relation_labels: null;
    mark_largely_following: boolean;
    impression_data: {
        group_id_list_a: Array<false>;
        group_id_list_b: Array<false>;
        similar_id_list_a: number[] | null;
        similar_id_list_b: number[] | null;
        group_id_list_c: Array<false>;
    };
    boost_status: number;
    authentication_token: string;
    libfinsert_task_id: string;
    social_tag_list: null;
    suggest_words: SuggestWords;
    show_follow_button: object;
    duet_aggregate_in_music_tab: boolean;
    is_duet_sing: boolean;
    comment_permission_info: CommentPermissionInfo;
    original_images: null;
    series_paid_info: SeriesPaidInfo;
    img_bitrate: null;
    comment_gid: number;
    image_album_music_info: ImageAlbumMusicInfo;
    video_tag: VideoTag[];
    is_collects_selected: number;
    chapter_list: null;
    feed_comment_config: object;
    is_image_beat: boolean;
    dislike_dimension_list: null;
    standard_bar_info_list: null;
    photo_search_entrance: PhotoSearchEntrance;
    danmaku_control: DanmakuControl;
    is_life_item: boolean;
    image_list: null;
    component_info_v2: string;
    item_warn_notification: ItemWarnNotification;
    origin_text_extra: null;
    disable_relation_bar: number;
    packed_clips: null;
    author_mask_tag: number;
    user_recommend_status: number;
    collection_corner_mark: number;
    image_comment: object;
    visual_search_info: {
        is_show_img_entrance: boolean;
        is_ecom_img: boolean;
        visual_search_longpress: number;
    };
    original_anchor_type: number;
    life_anchor_show_extra: LifeAnchorShowExtra;
    anchor_info: AnchorInfo;
    ancestor_info: AncestorInfo;
    horizontal_type: number;
    vtag_search: VtagSearch;
    hot_list: HotList;
    common_bar_info: string;
    star_atlas_info: StarAtlasInfo;
    share_post_info: SharePostInfo;
}

export interface PostData {
    status_code: number;
    min_cursor: number;
    max_cursor: number;
    has_more: number;
    aweme_list: Aweme[];
    time_list: string[];
    log_pb: LogPb;
    request_item_cursor: number;
    post_serial: number;
    replace_series_cover: number;
}
