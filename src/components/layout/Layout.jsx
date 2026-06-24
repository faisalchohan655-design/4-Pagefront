// frontend/src/components/layout/Layout.jsx
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
