interface FileInfo {
    type: string;
    file_id: string;
    file_name: string;
}

interface SaveButton {
    text: string;
    select_all_text: string;
}

export interface AnonymousShareInfo {
    file_count: number;
    share_name: string;
    file_infos: FileInfo[];
    creator_phone: string;
    avatar: string;
    display_name: string;
    save_button: SaveButton;
    updated_at: string;
    share_title: string;
    has_pwd: boolean;
    creator_id: string;
    creator_name: string;
    expiration: string;
    vip: string;
}

export interface TokenResponse {
    expire_time: string;
    expires_in: number;
    share_token: string;
}

interface ImageMediaMetadata {
    exif: string;
}

interface FileDetail {
    drive_id: string;
    domain_id: string;
    file_id: string;
    share_id: string;
    name: string;
    type: string;
    created_at: string;
    updated_at: string;
    file_extension: string;
    mime_type: string;
    mime_extension: string;
    size: number;
    parent_file_id: string;
    thumbnail: string;
    category: string;
    image_media_metadata: ImageMediaMetadata;
    punish_flag: number;
}

export interface ShareList {
    items: FileDetail[];
    next_marker: string;
}
