import { request } from "@/src/utils/request";
import { CommonResp } from "@/src/api/common.type";

interface GetServerInfoResp extends CommonResp  {
    data: {
        name: string;
        version: string;
    }
}

export async function ServerInfo() {
    return request.Get<GetServerInfoResp>(`/api/server_info`);
}
