"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Code,
  Settings,
  CreditCard,
  PlusCircle,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavProps {
  collapsed?: boolean;
}

export function Nav({ collapsed = false }: NavProps) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const navSections: NavSection[] = [
    {
      title: "主要功能",
      items: [
        {
          title: "仪表盘",
          href: "/dashboard",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          title: "算法列表",
          href: "/dashboard/algorithms",
          icon: <Code className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "管理选项",
      items: [
        {
          title: "新建算法",
          href: "/dashboard/algorithms/new",
          icon: <PlusCircle className="h-4 w-4" />,
          adminOnly: true,
        },
      ],
    },
    {
      title: "个人设置",
      items: [
        {
          title: "订阅管理",
          href: "/dashboard/subscriptions",
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          title: "账户设置",
          href: "/dashboard/settings",
          icon: <Settings className="h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <nav className="space-y-6">
      {navSections.map((section, index) => {
        // 过滤出该部分中当前用户有权限查看的菜单项
        const filteredItems = section.items.filter(
          (item) => !item.adminOnly || (item.adminOnly && isAdmin)
        );

        // 如果过滤后没有菜单项，则不显示该部分
        if (filteredItems.length === 0) return null;

        return (
          <div key={index} className="space-y-3">
            {!collapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary hover:bg-primary/10"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <span className={cn(collapsed ? "mx-auto" : "mr-2")}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.title}</span>}
                  {!collapsed && pathname === item.href && (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
