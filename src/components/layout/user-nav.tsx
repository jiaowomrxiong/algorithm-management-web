"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function LogoutDialog({ open, onClose, onConfirm }: LogoutDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg transform transition-all">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          确认退出
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            您确定要退出登录吗？退出后需要重新登录才能访问系统。
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            确认退出
          </Button>
        </div>
      </div>
    </div>
  );
}

export function UserNav() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      toast.success("已成功退出登录");
      router.push("/auth/login");
    } catch (error) {
      console.error("退出登录失败:", error);
      toast.error("退出登录失败，请重试");
      setIsLoggingOut(false);
    }
  };

  // 获取用户名首字母
  const userInitials = user.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex items-center gap-2">
      {/* 直接显示退出登录按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogoutClick}
        className="hidden md:flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        disabled={isLoggingOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isLoggingOut ? "退出中..." : "退出登录"}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-gray-200">
              <AvatarImage src="" alt={user.email || "用户头像"} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-gray-500">
                {user.role === "admin" ? "管理员" : "普通用户"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer flex items-center"
            onClick={() => router.push("/dashboard")}
          >
            <User className="mr-2 h-4 w-4" />
            <span>个人主页</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer flex items-center"
            onClick={() => router.push("/dashboard/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>账户设置</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 md:hidden"
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoggingOut ? "退出中..." : "退出登录"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 退出登录确认对话框 */}
      <LogoutDialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
