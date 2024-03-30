interface Likeicon {
    action_url: string;
    end_url: string;
    id: number;
    start_url: string;
}
interface Basic {
    comment_id_str: string;
    comment_type: number;
    jump_url?: string;
    like_icon: Likeicon;
    rid_str: string;
}
interface Containersize {
    height: number;
    width: number;
}
interface Posspec {
    axis_x: number;
    axis_y: number;
    coordinate_pos: number;
}
interface Renderspec {
    opacity: number;
}
interface Generalspec {
    pos_spec: Posspec;
    render_spec: Renderspec;
    size_spec: Containersize;
}
interface AVATARLAYER {}
interface Webcssstyle {
    borderRadius: string;
    'background-color'?: string;
    border?: string;
    boxSizing?: string;
}
interface Generalconfig {
    web_css_style: Webcssstyle;
}
interface GENERALCFG {
    config_type: number;
    general_config: Generalconfig;
}
interface Tags {
    AVATAR_LAYER?: AVATARLAYER;
    GENERAL_CFG: GENERALCFG;
    ICON_LAYER?: AVATARLAYER;
}
interface Layerconfig {
    is_critical?: boolean;
    tags: Tags;
}
interface Remote {
    bfs_style: string;
    url: string;
}
interface Imagesrc {
    placeholder?: number;
    remote?: Remote;
    src_type: number;
    local?: number;
}
interface Resimage {
    image_src: Imagesrc;
}
interface Resource {
    res_image: Resimage;
    res_type: number;
}
interface Layer {
    general_spec: Generalspec;
    layer_config: Layerconfig;
    resource: Resource;
    visible: boolean;
}
interface Fallbacklayers {
    is_critical_group: boolean;
    layers: Layer[];
}
interface Avatar {
    container_size: Containersize;
    fallback_layers: Fallbacklayers;
    mid: string;
}
interface Fan {
    color: string;
    is_fan: boolean;
    num_str: string;
    number: number;
}
interface Decorate {
    card_url: string;
    fan: Fan;
    id: number;
    jump_url: string;
    name: string;
    type: number;
}
interface Officialverify {
    desc: string;
    type: number;
}
interface Pendant {
    expire: number;
    image: string;
    image_enhance: string;
    image_enhance_frame: string;
    n_pid: number;
    name: string;
    pid: number;
}
interface Label {
    bg_color: string;
    bg_style: number;
    border_color: string;
    img_label_uri_hans: string;
    img_label_uri_hans_static: string;
    img_label_uri_hant: string;
    img_label_uri_hant_static: string;
    label_theme: string;
    path: string;
    text: string;
    text_color: string;
    use_img_label: boolean;
}
interface Vip {
    avatar_subscript: number;
    avatar_subscript_url: string;
    due_date: number;
    label: Label;
    nickname_color: string;
    status: number;
    theme_type: number;
    type: number;
}
interface Moduleauthor {
    avatar: Avatar;
    decorate?: Decorate;
    face: string;
    face_nft: boolean;
    following: boolean;
    jump_url: string;
    label: string;
    mid: number;
    name: string;
    official_verify: Officialverify;
    pendant: Pendant;
    pub_action: string;
    pub_location_text?: string;
    pub_time: string;
    pub_ts: number;
    type: AuthorType;
    vip: Vip;
}
interface Jumpstyle {
    icon_url: string;
    text: string;
}
interface Button {
    jump_style: Jumpstyle;
    jump_url: string;
    type: number;
}

interface Common {
    button: Button;
    cover: string;
    desc1: string;
    desc2: string;
    head_text: string;
    id_str: string;
    jump_url: string;
    style: number;
    sub_type: string;
    title: string;
}
interface Additional {
    common: Common;
    type: string;
}
interface Richtextnode {
    orig_text: string;
    rid?: string;
    text: string;
    type: string;
    jump_url?: string;
    emoji?: Emoji;
}
interface Desc {
    rich_text_nodes: Richtextnode[];
    text: string;
}
interface Pic {
    height: number;
    size: number;
    url: string;
    width: number;
}
interface Opus {
    fold_action: string[];
    jump_url: string;
    pics: Pic[];
    summary: Desc;
    title?: string;
}
interface Badge {
    bg_color: string;
    color: string;
    icon_url?: string;
    text: string;
}
interface Stat {
    danmaku: string;
    play: string;
}
interface Pgc {
    badge: Badge;
    cover: string;
    epid: number;
    jump_url: string;
    season_id: number;
    stat: Stat;
    stat_hidden: number;
    sub_type: number;
    title: string;
    type: number;
}
interface Live {
    badge: Badge;
    cover: string;
    desc_first: string;
    desc_second: string;
    id: number;
    jump_url: string;
    live_state: number;
    reserve_type: number;
    title: string;
}
interface Common2 {
    badge: Badge;
    biz_type: number;
    cover: string;
    desc: string;
    id: string;
    jump_url: string;
    label: string;
    sketch_id: string;
    style: number;
    title: string;
}
interface Archive {
    aid: string;
    badge: Badge;
    bvid: string;
    cover: string;
    desc: string;
    disable_preview: number;
    duration_text: string;
    jump_url: string;
    stat: Stat;
    title: string;
    type: number;
}
interface Major {
    opus?: Opus;
    type: MajorType;
    archive?: Archive;
    pgc?: Pgc;
    live?: Live;
    common?: Common2;
}
interface Moduledynamic {
    additional?: Additional;
    desc?: Desc;
    major?: Major;
    topic?: any;
}
interface Emoji {
    icon_url: string;
    size: number;
    text: string;
    type: number;
}

interface Item {
    desc: Desc;
    type: number;
}
interface Moduleinteraction {
    items: Item[];
}
interface Threepointitem {
    label: string;
    type: string;
}
interface Modulemore {
    three_point_items: Threepointitem[];
}
interface Comment {
    count: number;
    forbidden: boolean;
}
interface Like {
    count: number;
    forbidden: boolean;
    status: boolean;
}
interface Modulestat {
    comment: Comment;
    forward: Comment;
    like: Like;
}
interface Moduletag {
    text: string;
}
interface Modules {
    module_author: Moduleauthor;
    module_dynamic: Moduledynamic;
    module_interaction?: Moduleinteraction;
    module_more?: Modulemore;
    module_stat?: Modulestat;
    module_tag?: Moduletag;
}

export interface Orig {
    basic: Basic;
    id_str: string;
    modules: Modules;
    type: DynamicType;
    visible: boolean;
}
export interface Item2 {
    basic: Basic;
    id_str: string;
    modules: Modules;
    type: DynamicType;
    visible: boolean;
    orig?: Orig;
}
export interface Data {
    has_more: boolean;
    items: Item2[];
    offset: string;
    update_baseline: string;
    update_num: number;
}
// https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space
export interface BilibiliWebDynamicResponse {
    code: number;
    message: string;
    ttl: number;
    data: Data;
}

/**
 * 作者类型
 * AUTHOR_TYPE_PGC：番剧
 * AUTHOR_TYPE_NORMAL：用户
 */
export type AuthorType = 'AUTHOR_TYPE_PGC' | 'AUTHOR_TYPE_NORMAL';

/**
 *  动态类型
 * DYNAMIC_TYPE_FORWARD：转发动态
 * DYNAMIC_TYPE_AV：视频投稿
 * DYNAMIC_TYPE_PGC_UNION：番剧
 * DYNAMIC_TYPE_DRAW：图文
 * DYNAMIC_TYPE_WORD：文本
 * DYNAMIC_TYPE_ARTICLE：专栏
 * DYNAMIC_TYPE_LIVE：直播
 * DYNAMIC_TYPE_COMMON_SQUARE：普通正方形（专题页）
 */
export type DynamicType = 'DYNAMIC_TYPE_FORWARD' | 'DYNAMIC_TYPE_AV' | 'DYNAMIC_TYPE_PGC_UNION' | 'DYNAMIC_TYPE_DRAW' | 'DYNAMIC_TYPE_WORD' | 'DYNAMIC_TYPE_ARTICLE';

/**
 * 主要类型
 * MAJOR_TYPE_ARCHIVE：视频
 * MAJOR_TYPE_PGC：番剧
 * MAJOR_TYPE_OPUS：图文混排
 * MAJOR_TYPE_COMMON：普通
 * MAJOR_TYPE_LIVE：直播
 */
export type MajorType = 'MAJOR_TYPE_ARCHIVE' | 'MAJOR_TYPE_PGC' | 'MAJOR_TYPE_OPUS' | 'MAJOR_TYPE_COMMON' | 'MAJOR_TYPE_LIVE';
