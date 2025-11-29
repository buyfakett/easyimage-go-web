import { CommonResp } from "@/src/api/common.type";

export interface UploadImageParams {
    file: string | FormData;
}

export interface UploadImageResp extends CommonResp {
    url: string;
}

export interface DeleteImageParams {
    path: string;
}

export interface DeleteImageResp extends CommonResp {
}

export interface ListImagesParams {
    dir: string;
}

export interface ImageItem {
    name: string,
    path: string,
    url: string,
    type: string
}

export interface ListImagesResp extends CommonResp {
    total?: number;
    data?: ImageItem[];
}

