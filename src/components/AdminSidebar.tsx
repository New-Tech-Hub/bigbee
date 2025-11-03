import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Tags, 
  BarChart3, 
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { title: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { title: "Performance", icon: Activity, href: "/admin/performance" },
  { title: "Users", icon: Users, href: "/admin/users" },
  { title: "Products", icon: Package, href: "/admin/products" },
  { title: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { title: "Categories", icon: Tags, href: "/admin/categories" },
  { title: "Coupons", icon: Tags, href: "/admin/coupons" },
  { title: "Security", icon: Shield, href: "/admin/security" },
  { title: "Settings", icon: Settings, href: "/admin/settings" },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "relative flex flex-col bg-card border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex h-14 items-center justify-between px-4 border-b border-border">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground",
                isCollapsed && "justify-center"
              )
            }
            title={isCollapsed ? item.title : undefined}
          >
            <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}