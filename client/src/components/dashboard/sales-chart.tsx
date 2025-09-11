import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SalesChartProps {
  data?: Array<{
    day: string
    revenue: number
    orders: number
  }>
  loading?: boolean
}

export function SalesChart({ data, loading }: SalesChartProps) {
  const defaultData = [
    { day: "Mon", revenue: 2400, orders: 12 },
    { day: "Tue", revenue: 1398, orders: 8 },
    { day: "Wed", revenue: 9800, orders: 18 },
    { day: "Thu", revenue: 3908, orders: 14 },
    { day: "Fri", revenue: 4800, orders: 22 },
    { day: "Sat", revenue: 3800, orders: 16 },
    { day: "Sun", revenue: 4300, orders: 19 },
  ]

  const chartData = data || defaultData
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue))
  const maxOrders = Math.max(...chartData.map((d) => d.orders))

  if (loading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded w-32"></div>
            <div className="h-4 bg-muted rounded w-48"></div>
          </div>
          <div className="h-10 bg-muted rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle className="text-lg font-semibold">Sales Overview</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Revenue and order trends</p>
        </div>
        <Select defaultValue="7days">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="3months">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="w-full h-full p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Revenue (₹)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-muted-foreground">Orders</span>
              </div>
            </div>
          </div>

          <div className="relative h-60 flex items-end justify-around gap-2 px-4">
            {chartData.map((data, index) => (
              <div key={data.day} className="flex flex-col items-center gap-2 flex-1">
                <div className="flex items-end gap-1 h-48">
                  {/* Revenue Bar */}
                  <div
                    className="bg-primary rounded-t-lg w-6 transition-all duration-500 hover:opacity-80 cursor-pointer relative group"
                    style={{ height: `${(data.revenue / maxRevenue) * 180}px` }}
                    title={`Revenue: ₹${data.revenue.toLocaleString()}`}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{data.revenue.toLocaleString()}
                    </div>
                  </div>

                  {/* Orders Bar */}
                  <div
                    className="bg-accent rounded-t-lg w-6 transition-all duration-500 hover:opacity-80 cursor-pointer relative group"
                    style={{ height: `${(data.orders / maxOrders) * 180}px` }}
                    title={`Orders: ${data.orders}`}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {data.orders} orders
                    </div>
                  </div>
                </div>

                <span className="text-sm font-medium text-muted-foreground">{data.day}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-lg font-bold text-primary">
                ₹{chartData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <p className="text-lg font-bold text-accent">{chartData.reduce((sum, d) => sum + d.orders, 0)}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
