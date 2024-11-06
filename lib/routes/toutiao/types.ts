export interface Feed {
    abstract: string;
    aggr_type: number;
    article_sub_type: number;
    article_type: number;
    article_url: string;
    article_version: number;
    ban_comment: boolean;
    behot_time: number;
    bury_count: number;
    bury_style_show: number;
    cell_ctrls: CellCtrls;
    cell_flag: number;
    cell_layout_style: number;
    /**
     * 0: video
     * 32: text (w)
     * 49: video
     * 60: article
     */
    cell_type: number;
    comment_count: number;
    common_raw_data: string;
    /**
     * Appears only if cell_type is 32
     */
    content: string;
    content_decoration: string;
    control_meta: ControlMeta;
    cursor: number;
    data_type: number;
    digg_count: number;
    display_url: string;
    forum_extra_data: string;
    forward_info: ForwardInfo;
    gallary_image_count: number;
    group_flags: number;
    group_id: string;
    group_source: number;
    group_type: number;
    has_image: boolean;
    has_m3u8_video: boolean;
    has_mp4_video: boolean;
    has_video: boolean;
    hot: number;
    id: string;
    is_original: boolean;
    itemCell: ItemCell;
    itemCellDebug: null;
    item_id: string;
    item_id_str: string;
    item_version: number;
    label_style: number;
    level: number;
    like_count: number;
    log_pb: LogPb;
    lynx_server: LynxServer;
    natant_level: number;
    preload_web: number;
    publish_time: number;
    /**
     * Appears only if cell_type is 32
     */
    rich_content: string;
    read_count: number;
    reback_flag: number;
    repin_count: number;
    repin_time: number;
    req_id: string;
    share_url: string;
    show_more: ShowMore;
    source: string;
    subject_group_id: number;
    tag_id: number;
    tip: number;
    title: string;
    url: string;
    /**
     * Appears only if cell_type is 32, 49(0)
     */
    user: UserInfoCell32 | UserInfoCell49;
    user_bury: number;
    user_digg: number;
    /**
     * Appears only if cell_type is 0, 60
     */
    user_info: UserInfoCell60;
    user_like: number;
    user_repin: number;
    user_repin_time: number;
    /**
     * Appears only if cell_type is 0, 49
     */
    video: Video;
    video_duration: number;
    video_style: number;
    image_list: ImageListItem[];
    large_image_list: LargeImageListItem[];
    middle_image: MiddleImage;
    video_detail_info: VideoDetailInfo;
}

interface CellCtrls {
    cell_flag: number;
    cell_height: number;
    cell_layout_style: number;
}

interface ControlMeta {
    modify: Modify;
    remove: Remove;
    share: Share;
}

interface Modify {
    hide: boolean;
    name: string;
    permission: boolean;
    tips: string;
}

interface Remove {
    hide: boolean;
    name: string;
    permission: boolean;
    tips: string;
}

interface Share {
    hide: boolean;
    name: string;
    permission: boolean;
    tips: string;
}

interface ForwardInfo {
    forward_count: number;
}

interface ItemCell {
    actionCtrl: ActionCtrl;
    articleBase: ArticleBase;
    articleClassification: ArticleClassification;
    cellCtrl: CellCtrl;
    extra: Extra;
    imageList: ImageList;
    itemCounter: ItemCounter;
    locationInfo: LocationInfo;
    shareInfo: ShareInfo;
    tagInfo: TagInfo;
    userInteraction: UserInteraction;
    videoInfo: VideoInfo;
}

interface ActionCtrl {
    actionBar: ActionBar;
    banBury: boolean;
    banComment: boolean;
    banDigg: boolean;
    controlMeta: ActionControlMeta;
}

interface ActionBar {
    actionSettingList: ActionSetting[];
}

interface ActionSetting {
    actionType: number;
    styleSetting: StyleSetting;
}

interface StyleSetting {
    iconKey: string;
    layoutDirection: number;
    text: string;
}

interface ActionControlMeta {
    modify: ActionModify;
    remove: ActionRemove;
    share: ActionShare;
}

interface ActionModify {
    permission: boolean;
    tips: string;
}

interface ActionRemove {
    permission: boolean;
    tips: string;
}

interface ActionShare {
    permission: boolean;
    tips: string;
}

interface ArticleBase {
    gidStr: string;
    itemStatus: number;
}

interface ArticleClassification {
    aggrType: number;
    articleSubType: number;
    articleType: number;
    bizID: number;
    bizTag: number;
    groupSource: number;
    isForAudioPlaylist: boolean;
    isOriginal: boolean;
    isSubject: boolean;
    level: number;
}

interface CellCtrl {
    buryStyleShow: number;
    cellFlag: number;
    cellLayoutStyle: number;
    cellType: number;
    cellUIType: string;
    groupFlags: number;
}

interface Extra {
    ping: string;
}

type ImageList = unknown;

interface ItemCounter {
    commentCount: number;
    diggCount: number;
    forwardCount: number;
    readCount: number;
    repinCount: number;
    shareCount: number;
    showCount: number;
    textCount: number;
    videoWatchCount: number;
    buryCount: number;
}

interface LocationInfo {
    publishLocInfo: string;
}

interface ShareInfo {
    shareURL: string;
    shareControl: ShareControl;
}

interface ShareControl {
    isHighQuality: boolean;
}

type TagInfo = unknown;

interface UserInteraction {
    userDigg: boolean;
    userRepin: boolean;
}

type VideoInfo = unknown;

interface Video {
    bitrate: number;
    codec_type: string;
    definition: string;
    download_addr: DownloadAddr;
    duration: number;
    encode_user_tag: string;
    file_hash: string;
    height: number;
    origin_cover: OriginCover;
    play_addr: PlayAddr;
    play_addr_list: PlayAddrListItem[];
    ratio: string;
    size: number;
    url_expire: number;
    video_id: string;
    volume: Volume;
    vtype: string;
    width: number;
}

interface DownloadAddr {
    uri: string;
    url_list: string[];
}

interface OriginCover {
    uri: string;
    url_list: string[];
}

interface PlayAddr {
    uri: string;
    url_list: string[];
}

interface PlayAddrListItem {
    bitrate: number;
    codec_type: string;
    definition: string;
    encode_user_tag: string;
    file_hash: string;
    play_url_list: string[];
    quality: string;
    size: number;
    url_expire: number;
    video_quality: number;
    volume: Volume;
    vtype: string;
}

interface Volume {
    Loudness: number;
    Peak: number;
}

interface LogPb {
    cell_layout_style: string;
    group_id_str: string;
    group_source: string;
    impr_id: string;
    is_following: string;
    is_yaowen: string;
}

type LynxServer = unknown;

interface ShowMore {
    title: string;
    url: string;
}

interface UserInfoCell32 {
    avatar_url: string;
    desc: string;
    id: number;
    is_blocked: number;
    is_blocking: number;
    is_followed: number;
    is_following: number;
    is_friend: number;
    live_info_type: number;
    medals: unknown;
    name: string;
    remark_name: string;
    schema: string;
    screen_name: string;
    theme_day: string;
    user_auth_info: string;
    user_decoration: string;
    user_id: string;
    user_verified: number;
    verified_content: string;
}

interface UserInfoCell49 {
    info: {
        avatar_uri: string;
        avatar_url: string;
        ban_status: boolean;
        desc: string;
        media_id: string;
        name: string;
        origin_profile_url: boolean;
        origin_user_id: string;
        schema: string;
        user_auth_info: string;
        user_id: string;
        user_verified: number;
        verified_content: string;
    };
    relation: {
        is_followed: number;
        is_following: number;
        is_friend: number;
    };
    relation_count: {
        followers_count: number;
        following_count: number;
    };
    user_id: string;
}

interface UserInfoCell60 {
    avatar_url: string;
    description: string;
    follow: boolean;
    name: string;
    user_auth_info: string;
    user_id: string;
    user_verified: boolean;
    verified_content: string;
}

interface ImageListItem {
    height: number;
    uri: string;
    url: string;
    url_list: UrlList[];
    width: number;
}

interface UrlList {
    url: string;
}

interface LargeImageListItem {
    height: number;
    uri: string;
    url: string;
    url_list: UrlList[];
    width: number;
}

interface MiddleImage {
    height: number;
    uri: string;
    url: string;
    url_list: UrlList[];
    width: number;
}

interface VideoDetailInfo {
    detail_video_large_image: DetailVideoLargeImage;
    direct_play: number;
    group_flags: number;
    show_pgc_subscribe: number;
    video_id: string;
}

interface DetailVideoLargeImage {
    height: number;
    uri: string;
    url: string;
    url_list: UrlList[];
    width: number;
}
