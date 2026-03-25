// src/routes.ts
import JobsCollectionPage from './pages/jobs';

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  name: string;
  exact?: boolean;
}

const routes: RouteConfig[] = [
  {
    path: '/jobs',
    component: JobsCollectionPage,
    name: '职位收集',
    exact: true
  },
  // 可以在这里添加更多路由
];

export default routes;