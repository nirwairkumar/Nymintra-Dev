import { NavLink } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  Users, 
  Settings, 
  ListTodo,
  LayoutDashboard,
  PlusCircle
} from 'lucide-react';

const navItems = [
  { name: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Orders', path: '/admin/orders', icon: Truck },
  { name: 'Cards', path: '/admin/designs', icon: Package },
  { name: 'Forms', path: '/admin/forms', icon: ListTodo },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-card border-r flex flex-col sticky top-0 h-screen overflow-y-auto shrink-0 shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-serif font-bold text-primary tracking-tight">Nymintra Admin</h2>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Management Portal</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
              ${isActive 
                ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground border-l-4 border-transparent'}
            `}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <NavLink 
          to="/admin/designs/upload"
          className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          Quick Upload
        </NavLink>
      </div>

      <div className="p-4 bg-muted/30 text-[10px] text-muted-foreground text-center">
        © 2026 Nymintra Dev Console
      </div>
    </aside>
  );
}
