import { request } from "@/src/utils/request";
import { CommonResp } from "@/src/api/common.type";

interface GetServerInfoResp extends CommonResp  {
    data: {
        name: string;
        version: string;
    }
}

interface TestTokenResp extends CommonResp {}

export async function ServerInfo() {
    return request.Get<GetServerInfoResp>(`/api/server_info`);
}

export async function TestToken() {
    return request.Get<TestTokenResp>(`/api/test_token`);
}