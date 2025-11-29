import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./router/routes";
import { Spin } from '@douyinfe/semi-ui-19';

// 创建浏览器路由实例
const router = createBrowserRouter(routes);

function App() {
    return (
        <RouterProvider
            router={router}
            fallbackElement={<Spin/>}
        />
    );
}

export default App;
