import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, RefreshCw, Award, Target, CheckCircle } from "lucide-react"
import { DashboardMetricsGrid } from "./dashboard-metrics"
import { SalesChart } from "./sales-chart"
import { RecentOrders } from "./recent-orders"
import type { DashboardMetrics, Order, User } from "@/types"

interface DashboardProps {
  metrics: DashboardMetrics
  orders: Order[]
  currentUser: User
  loading?: boolean
  onViewChange: (view: string) => void
}

export function Dashboard({ metrics, orders, currentUser, loading, onViewChange }: DashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {currentUser.name}!</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your business today</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Activity className="w-3 h-3 mr-1" />
              System Online
            </Badge>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <DashboardMetricsGrid metrics={metrics} loading={loading} />

      {/* Charts and Real-time Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview */}
        <SalesChart loading={loading} />

        {/* Recent Orders */}
        <RecentOrders orders={orders} loading={loading} onViewAll={() => onViewChange("orders")} />
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Top Category</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">Vegetables</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Most popular</p>
              </div>
              <Award className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Avg Order Value</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(metrics.dailyRevenue / Math.max(metrics.totalOrders, 1))}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">Per transaction</p>
              </div>
              <Target className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {orders.length > 0
                    ? Math.round((orders.filter((o) => o.status === "delivered").length / orders.length) * 100)
                    : 0}
                  %
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Orders delivered</p>
              </div>
              <CheckCircle className="w-12 h-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
