import { authStore } from "@/src/stores/useAuthStore";

// 设置 token
export function setToken(token: string): void {
    authStore.setState({token});
}

// 获取 token 
export function getToken(): string | null {
    return authStore.getState().token;
}

// 删除 token
export function removeToken(): void {
    authStore.setState({token: null});
}
