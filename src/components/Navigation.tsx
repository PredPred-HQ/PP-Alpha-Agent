// src/components/Navigation.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // 假设使用react-router

interface NavItem {
  name: string;
  path: string;
  icon?: string;
}

const Navigation: React.FC = () => {
  const navItems: NavItem[] = [
    { name: '首页', path: '/' },
    { name: '职位收集', path: '/jobs' }, // 新增的职位收集页面
    { name: 'AI 分析', path: '/analysis' },
    { name: '交易策略', path: '/strategies' },
    { name: '账户管理', path: '/account' }
  ];

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <div className="logo">
          <Link to="/">PP-Alpha-Agent</Link>
        </div>
        <ul className="nav-menu">
          {navItems.map((item, index) => (
            <li key={index} className="nav-item">
              <Link to={item.path} className="nav-link">
                {item.icon && <span className="nav-icon">{item.icon}</span>}
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <style jsx>{`
        .main-navigation {
          background-color: #ffffff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 60px;
        }
        
        .logo a {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          text-decoration: none;
        }
        
        .nav-menu {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 30px;
        }
        
        .nav-item {
          margin: 0;
        }
        
        .nav-link {
          text-decoration: none;
          color: #666;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 4px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .nav-link:hover {
          color: #333;
          background-color: #f5f5f5;
        }
        
        .nav-link.active {
          color: #667eea;
          background-color: #f0f5ff;
        }
        
        .nav-icon {
          font-size: 16px;
        }
      `}</style>
    </nav>
  );
};

export default Navigation;