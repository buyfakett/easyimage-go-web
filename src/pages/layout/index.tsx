import React, { Suspense, useEffect, useState } from "react";
import { Layout as MainLayout, Nav, Spin } from "@douyinfe/semi-ui-19";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { defaultOpenKeys, MenuRoutes } from "@/src/router/routes";
import { OnSelectedData } from "@douyinfe/semi-ui-19/lib/es/navigation";
import { removeToken } from "@/src/utils/auth";
import { APP_LOGIN_REDIRECT_URI, APP_LOGIN_URI, APP_NAME } from "@/src/config";
import Footer from "@/src/pages/layout/Footer";
import SwitchThemeButton from "@/src/components/SwitchThemeButton";
// @ts-ignore
import logo from "@/src/images/easyimage-go.png"

const {Header, Sider, Content} = MainLayout;

export default function Layout() {
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const [pathKey, setPathKey] = useState<string[]>([]);

    const logout = () => {
        removeToken();
        navigate(APP_LOGIN_URI);
    };

    const onSelect = (data: OnSelectedData) => {
        // 设置浏览器title
        document.title = `${data.selectedItems[0].text}-${APP_NAME}`;
        setPathKey(data.selectedKeys.map(String));
        navigate(data.itemKey as string);
    };

    useEffect(() => {
        setPathKey([pathname]);
    }, [pathname]);

    return (
        <>
            <MainLayout
                className="bg-(--semi-color-tertiary-light-default)"
                style={{height: '100vh', display: 'flex', flexDirection: 'column'}}
            >
                <Header>
                    <Nav
                        className="min-w-screen"
                        mode="horizontal"
                        header={{
                            logo: (
                                <div
                                    onClick={() => navigate(APP_LOGIN_REDIRECT_URI)}
                                    style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}
                                >
                                    <img src={logo} alt="logo" style={{width: '32px', height: '32px'}}/>
                                </div>
                            ),
                            text: (
                                <div
                                    onClick={() => navigate(APP_LOGIN_REDIRECT_URI)}
                                    style={{cursor: 'pointer', fontWeight: 500}}
                                >
                                    {APP_NAME} 管理后台
                                </div>
                            ),
                        }}
                        footer={<>
                            <SwitchThemeButton/>
                            <button onClick={logout} style={{
                                cursor: 'pointer',
                                padding: '6px 16px',
                                margin: '0 8px',
                                border: '1px solid var(--semi-color-border)',
                                borderRadius: '4px',
                                background: 'var(--semi-color-bg-0)',
                                color: 'var(--semi-color-text-0)',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}>退出
                            </button>
                        </>}/>
                </Header>
                <MainLayout style={{flex: 1, overflow: 'hidden'}}>
                    <div className="flex flex-1" style={{minHeight: '0'}}>
                        <Sider
                            style={{
                                height: '100%',
                                overflow: 'auto',
                                position: 'sticky',
                                top: 60,
                                zIndex: 10
                            }}
                        >
                            <Nav
                                defaultIsCollapsed={false}
                                mode="vertical"
                                style={{height: '100%', minHeight: 'calc(100vh - 120px)'}}
                                selectedKeys={pathKey}
                                items={MenuRoutes}
                                defaultOpenKeys={defaultOpenKeys}
                                onSelect={(data) => onSelect(data)}
                                footer={{
                                    collapseButton: true,
                                }}/>
                        </Sider>
                        <Content className="overflow-auto">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={location.pathname}
                                    initial={{opacity: 0, x: -50}}
                                    animate={{opacity: 1, x: 0}}
                                    exit={{opacity: 0, x: 50}}
                                    transition={{duration: 0.5}}
                                >
                                    <Suspense
                                        fallback={<div className="flex items-center justify-center w-screen h-screen">
                                            <Spin/>
                                        </div>}
                                    >
                                        <Outlet/>
                                    </Suspense>
                                </motion.div>
                            </AnimatePresence>
                        </Content>
                    </div>
                </MainLayout>
                <Footer/>
            </MainLayout>
        </>
    );
}
