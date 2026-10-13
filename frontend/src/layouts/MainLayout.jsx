import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--soc-bg-dark)' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="d-flex flex-grow-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main
          className="flex-grow-1 p-3 p-md-4 main-content-wrapper"
          style={{
            overflowX: 'hidden'
          }}
        >
          <style>{`
            @media (min-width: 992px) {
              .main-content-wrapper {
                margin-left: 250px !important;
                width: calc(100% - 250px) !important;
              }
            }
          `}</style>
          <div className="container-fluid p-0" style={{ maxWidth: '1600px' }}>
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};
