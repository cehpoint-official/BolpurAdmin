import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Menu, Search, Bell, Moon, Sun, Download, RefreshCw } from "lucide-react"

interface TopBarProps {
  activeView: string
  darkMode: boolean
  onToggleDarkMode: () => void
  searchValue: string
  onSearchChange: (value: string) => void
  pendingNotifications: number
  viewMetrics: {
    [key: string]: string
  }
}

const getViewTitle = (view: string) => {
  const titles: { [key: string]: string } = {
    dashboard: "Dashboard",
    products: "Products",
    vendors: "Vendors",
    orders: "Orders",
    users: "Users",
    analytics: "Analytics",
    settings: "Settings",
  }
  return titles[view] || view
}

export function TopBar({
  activeView,
  darkMode,
  onToggleDarkMode,
  searchValue,
  onSearchChange,
  pendingNotifications,
  viewMetrics,
}: TopBarProps) {
  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-foreground capitalize">{getViewTitle(activeView)}</h2>
            <Badge variant="outline" className="text-xs">
              {viewMetrics[activeView] || "Loading..."}
            </Badge>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search - Hidden on small screens */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search anything..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-80 pl-10 bg-background/50"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {pendingNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {pendingNotifications > 99 ? "99+" : pendingNotifications}
                </span>
              )}
            </Button>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={onToggleDarkMode} className="hover:bg-muted">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* Action Buttons - Hidden on small screens */}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <RefreshCw className="w-4 h-4" />
                <span className="hidden md:inline">Refresh</span>
              </Button>

              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search - Shown on small screens when needed */}
      <div className="mt-4 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search anything..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 bg-background/50"
          />
        </div>
      </div>
    </header>
  )
}
