export interface Detail {
    group: Group;
    app: App;
}

interface Group {
    id: number;
    app_id: number;
    title: string;
    intro: string;
    has_treasure: boolean;
    has_official: boolean;
    icon: Icon;
    banner: Banner;
    moderators: Moderator[];
    log: Log;
    event_log: EventLog;
    stat: Stat;
    web_url: string;
    style_info: StyleInfo;
    terms: Term[];
    sharing: Sharing;
    new_rec_list: NewRecListItem[];
    actions: Actions;
    title_labels: TitleLabel[];
}

interface Icon {
    url: string;
    medium_url: string;
    small_url: string;
    original_url: string;
    original_format: string;
    width: number;
    height: number;
    color: string;
    original_size: number;
}

interface Banner {
    url: string;
    medium_url: string;
    small_url: string;
    original_url: string;
    original_format: string;
    width: number;
    height: number;
    color: string;
    original_size: number;
}

interface Moderator {
    id: number;
    name: string;
    avatar: string;
    medium_avatar: string;
    avatar_pendant: string;
    badges: Badge[];
    verified: Verified;
}

interface Badge {
    id: number;
    title: string;
    description: string;
    is_wear: boolean;
    icon: BadgeIcon;
    style: BadgeStyle;
    time: number;
    unlock_tips: string;
    level: number;
    status: number;
}

interface BadgeIcon {
    small: string;
    middle: string;
    large: string;
    small_border: string;
}

interface BadgeStyle {
    background_image: string;
    background_color: string;
    font_color: string;
    border_background_color: string;
}

interface Verified {
    type: string;
    reason: string;
    url: string;
}

interface Log {
    follow: Follow;
    unfollow: Follow;
}

interface Follow {
    uri: string;
    params: FollowParams;
}

interface FollowParams {
    type: string;
    APIVersion: string;
    paramId: string;
    paramType: string;
}

interface EventLog {
    paramType: string;
    paramId: string;
}

interface Stat {
    favorite_count: number;
    topic_count: number;
    elite_topic_count: number;
    recent_topic_count: number;
    official_topic_count: number;
    top_topic_count: number;
    video_count: number;
    user_moment_count: number;
    app_moment_count: number;
    image_moment_count: number;
    treasure_count: number;
    topic_page_view: number;
    feed_count: number;
    topic_pv_total: number;
}

interface StyleInfo {
    background_color: string;
    font_color: string;
}

interface Term {
    label: string;
    type: string;
    index: string;
    params: TermParams;
    sort: TermSort[];
    log: TermLog;
    position: string;
    referer_ext: string;
    log_keyword: string;
    top_params: TermParams;
    sub_terms: SubTerm[];
}

interface TermParams {
    type: string;
}

interface TermSort {
    label: string;
    params: SortParams;
    icon_type: string;
}

interface SortParams {
    sort: string;
}

interface TermLog {
    page_view: PageView;
}

interface PageView {
    uri: string;
    params: PageViewParams;
}

interface PageViewParams {
    type: string;
    APIVersion: string;
    paramId: string;
    paramType: string;
    position: string;
}

interface SubTerm {
    label: string;
    type: string;
    index: string;
    params: SubTermParams;
    top_params: SubTermTopParams;
    sort: SubTermSort[];
    log: SubTermLog;
    referer_ext: string;
    log_keyword: string;
    uri: string;
    web_url: string;
}

interface SubTermParams {
    group_label_id: string;
    type: string;
}

interface SubTermTopParams {
    group_label_id: string;
    is_top: string;
    type: string;
}

interface SubTermSort {
    label: string;
    params: SortParams;
    icon_type: string;
}

interface SubTermLog {
    page_view: PageView;
}

interface Sharing {
    url: string;
    title: string;
    description: string;
    image: Icon;
}

interface NewRecListItem {
    icon: Icon;
    uri: string;
    url: string;
    web_url: string;
    label: string;
}

interface Actions {
    publish_contents: boolean;
}

interface TitleLabel {
    label: string;
    icon: Icon;
}

interface App {
    id: number;
    identifier: string;
    title: string;
    title_labels: string[];
    icon: Icon;
    price: Price;
    uri: Uri;
    can_view: boolean;
    released_time: number;
    button_flag: number;
    style: number;
    hidden_button: boolean;
    is_deny_minors: boolean;
    stat: AppStat;
    ad_banner: Icon;
    top_banner: Icon;
    banner: Icon;
    tags: Tag[];
    log: AppLog;
    event_log: EventLog;
    can_buy_redeem_code: CanBuyRedeemCode;
    show_module: ShowModule[];
    complaint: Complaint;
    serial_number: SerialNumber;
    rec_text: string;
    readable_id: string;
    m_button_map: object;
    description: Description;
    title_labels_v2: TitleLabel[];
    stat_key: string;
    include_app_product_type_complete: boolean;
    is_console_game: boolean;
}

interface Price {
    taptap_current: string;
    discount_rate: number;
}

interface Uri {
    google: string;
    google_play: string;
    apple: string;
    download_site: string;
}

interface AppStat {
    rating: Rating;
    vote_info: VoteInfo;
    hits_total: number;
    play_total: number;
    bought_count: number;
    feed_count: number;
    reserve_count: number;
    recent_sandbox_played_count: number;
    album_count: number;
    review_count: number;
    topic_count: number;
    video_count: number;
    official_topic_count: number;
    official_video_count: number;
    official_album_count: number;
    fans_count: number;
}

interface Rating {
    score: string;
    max: number;
    latest_score: string;
    latest_version_score: string;
}

interface VoteInfo {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
}

interface Tag {
    id: number;
    value: string;
    uri: string;
    web_url: string;
}

interface AppLog {
    follow: Follow;
    open: Follow;
    page_view: Follow;
    play: Follow;
    reserve: Follow;
    unfollow: Follow;
    unreserved: Follow;
}

interface CanBuyRedeemCode {
    flag: boolean;
}

interface ShowModule {
    key: string;
    value: boolean;
}

interface Complaint {
    uri: string;
    web_url: string;
    url: string;
}

interface SerialNumber {
    number_exists: boolean;
    button_action: number;
}

interface Description {
    text: string;
}
