import React, { useState, useRef, useEffect, JSX } from 'react';
import classNames from 'classnames';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/20/solid';
import { 
  ArrowLeftStartOnRectangleIcon, 
  UserIcon,
  HomeIcon as HomeIconSolid, 
  TruckIcon as TruckIconSolid, 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  ComputerDesktopIcon as ComputerDesktopIconSolid,
  ClockIcon as ClockIconSolid,
  FolderIcon as FolderIconSolid 
} from '@heroicons/react/24/solid';
import { 
  HomeIcon as HomeIconOutline, 
  TruckIcon as TruckIconOutline, 
  MagnifyingGlassIcon as MagnifyingGlassIconOutline,
  ComputerDesktopIcon as ComputerDesktopIconOutline,
  ClockIcon as ClockIconOutline,
  FolderIcon as FolderIconOutline 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

interface SidebarLinkProps {
  link: SidebarLink;
  collapsed: boolean;
}

interface SidebarLink {
  key: string;
  label: string;
  path: string;
  icon: (props: { isActive: boolean }) => JSX.Element;
}

const DASHBOARD_SIDEBAR_LINKS: SidebarLink[] = [
  {
    key: 'dashboard',
    label: 'ภาพรวมการใช้งานลานจอด',
    path: '/dashboard',
    icon: ({ isActive }) => isActive ? <HomeIconSolid className='w-5 h-5' /> : <HomeIconOutline className='w-5 h-5' />,
  },
  {
    key: 'findCar',
    label: 'ค้นหาตำแหน่งจอดรถ',
    path: '/findCar',
    icon: ({ isActive }) => isActive ? <TruckIconSolid className='w-5 h-5' /> : <TruckIconOutline className='w-5 h-5' />,
  },
  {
    key: 'findSlot',
    label: 'ค้นหาตำแหน่งช่องจอด',
    path: '/findSlot',
    icon: ({ isActive }) => isActive ? <MagnifyingGlassIconSolid className='w-5 h-5' /> : <MagnifyingGlassIconOutline className='w-5 h-5' />,
  },
  {
    key: 'equipment',
    label: 'ข้อมูลอุปกรณ์',
    path: '/equipment',
    icon: ({ isActive }) => isActive ? <FolderIconSolid className='w-5 h-5' /> : <FolderIconOutline className='w-5 h-5' />,
  },
  {
    key: 'history',
    label: 'ประวัติการใช้งานรถ',
    path: '/history',
    icon: ({ isActive }) => isActive ? <ClockIconSolid className='w-5 h-5' /> : <ClockIconOutline className='w-5 h-5' />,
  },
  {
    key: 'display',
    label: 'จอแสดงภาพ',
    path: '/display',
    icon: ({ isActive }) => isActive ? <ComputerDesktopIconSolid className='w-5 h-5' /> : <ComputerDesktopIconOutline className='w-5 h-5' />,
  },
];

const SidebarHeader: React.FC<{ collapsed: boolean; onToggle: () => void }> = ({ collapsed, onToggle }) => (
  <div className={classNames(
    'flex items-center px-1 py-3 border-b border-gray-200',
    'transition-all duration-500 ease-in-out',
    { 'justify-center': collapsed, 'justify-between': !collapsed }
  )}>
    <div className={classNames(
      'overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap flex gap-2 items-center',
      { 'w-0 opacity-0': collapsed, 'w-40 opacity-100': !collapsed }
    )}>
      {/* <img
        src='https://static.thenounproject.com/png/710491-200.png'
        alt='logo'
        className='w-10 h-10'
      /> */}
        <img
        src='/src/assets/logo.svg'
        alt='logo'
        className='w-10 h-10'
      />
      <span className="text-lg font-bold text-header">JodMaiLhong</span>
    </div>
    <button
      className={classNames(
        'flex items-center px-2 py-2 rounded-lg',
        'hover:bg-secondary transition-all duration-500 ease-in-out'
      )}
      onClick={onToggle}
    >
      {collapsed ? <ChevronRightIcon className='w-6 h-6 text-header' /> : <ChevronLeftIcon className='w-6 h-6 text-header' />}
    </button>
  </div>
);

const SidebarLink: React.FC<SidebarLinkProps> = ({ link, collapsed }) => {
  const { pathname } = useLocation();
  const isActive = pathname === link.path;

  return (
    <Link
      to={link.path}
      className={classNames(
        'flex items-center gap-2 rounded-lg px-3 py-2',
        {
          'bg-secondary text-primary': isActive,
          'text-header hover:text-header hover:bg-secondary': !isActive
        }
      )}
    >
      <span className="text-xl">{link.icon({ isActive })}</span>
      <div className={classNames(
        'overflow-hidden whitespace-nowrap',
        { 'w-0 opacity-0': collapsed, 'w-72 opacity-100': !collapsed }
      )}>
        <p className="font-medium">{link.label}</p>
      </div>
    </Link>
  );
};

const UserSection: React.FC<{
  collapsed: boolean;
  onLogout: () => void
}> = ({ collapsed, onLogout }) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
      {collapsed ? (
        <button
          className={classNames(
            'flex items-center w-full justify-center rounded-lg h-[40px]',
            'hover:bg-secondary transition-all duration-500 ease-in-out'
          )}
          onClick={onLogout}
        >
          <ArrowLeftStartOnRectangleIcon className='w-6 h-6 text-header' />
        </button>
      ) : (
        <div className={classNames(
          'flex items-center gap-2 w-full justify-between',
          'transition-all duration-500 ease-in-out'
        )}>
          <div className="flex gap-2 items-center">
            <UserIcon className="w-6 h-6 text-header" />
            <div>
              <p className="font-bold text-sm text-header">{user?.username || 'Guest'}</p>
              <p className="text-xs text-gray-400">{user?.email || 'Admin'}</p>
            </div>
          </div>
          <button
            className="flex items-center px-2 py-2 rounded-lg hover:bg-secondary"
            onClick={onLogout}
          >
            <ArrowLeftStartOnRectangleIcon className='w-6 h-6 text-header' />
          </button>
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setCollapsed(window.innerWidth < 768);
    };

    window.addEventListener('resize', checkScreenSize);
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleCollapse = () => {
    if (window.innerWidth >= 768) {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div
      ref={sidebarRef}
      className={classNames(
        'bg-white border-r border-gray-200 h-full p-3 flex flex-col relative',
        'transition-all duration-500 ease-in-out',
        { 'w-16': collapsed, 'w-80': !collapsed }
      )}
    >
      <SidebarHeader
        collapsed={collapsed}
        onToggle={toggleCollapse}
      />

      <div className="py-4 flex flex-1 flex-col gap-2 overflow-y-auto">
        {DASHBOARD_SIDEBAR_LINKS.map((link) => (
          <SidebarLink
            key={link.key}
            link={link}
            collapsed={collapsed}
          />
        ))}
      </div>

      <UserSection
        collapsed={collapsed}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Sidebar;