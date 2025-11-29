import React, { ReactElement } from 'react';
import { RouteObject } from 'react-router-dom';
import Wrapper from './wrapper';
import { IconImage, IconUpload } from '@douyinfe/semi-icons';

import Layout from '@/src/pages/layout';
import LayoutWithTopNav from '@/src/pages/layout/layoutWithTopNav';

import Login from '@/src/pages/login';

import ImageUpload from '@/src/pages/image/upload';
import ImageConsole from '@/src/pages/image/console';


import NotFond from '@/src/pages/exception/404';

export interface IRouters {
    text: string;
    icon?: ReactElement;
    items?: IRouters[];
    itemKey: string;
}

// 路由默认打开
export const defaultOpenKeys = ['/image/upload'];

// 左侧导航路由
export const MenuRoutes: IRouters[] = [
    {
        itemKey: '/image/upload',
        icon: <IconUpload />,
        text: '图片上传',
    },
    {
        itemKey: '/image/console',
        icon: <IconImage />,
        text: '图片控制台',
    },
];

// 浏览器路由
export const routes: RouteObject[] = [
    {
        path: '/',
        element: <Wrapper component={<Layout/>} auth/>,
        // 导航内的路由写在这里，同时要添加到Menu中
        children: [
            {
                path: 'image/upload',
                element: <Wrapper component={<ImageUpload/>}/>
            },
            {
                path: 'image/console',
                element: <Wrapper component={<ImageConsole/>}/>
            },
        ]
    },
    // 有顶部导航，没有侧边导航写这里
    {
        path: '/user',
        element: <LayoutWithTopNav/>,
        children: [
            {
                path: 'login',
                element: <Wrapper component={<Login/>}/>
            },
        ]
    },
    // 异常页路由
    {
        path: '/exception',
        element: <LayoutWithTopNav/>,
        children: [
            {
                path: '404',
                element: <Wrapper component={<NotFond/>}/>
            },
        ]
    },
    // 兜底页面，需要放在最下方
    {
        path: '*',
        element: (
            <div className='flex flex-col items-center justify-center w-screen h-screen'>
                <NotFond/>
            </div>
        )
    }
]
