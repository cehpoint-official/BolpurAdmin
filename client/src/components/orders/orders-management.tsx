import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, type Column } from "@/components/ui/data-table"
import { OrderDetails } from "./order-details"
import { Download, RefreshCw } from "lucide-react"
import type { Order } from "@/types"
import { ORDER_STATUSES } from "@/constants"
import { useDataTable } from "@/hooks/use-data-table"

interface OrdersManagementProps {
  orders: Order[]
  loading?: boolean
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>
}

export function OrdersManagement({ orders, loading, onUpdateOrderStatus }: OrdersManagementProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState("")

  const {
    data: filteredOrders,
    pagination,
    selectedRowKeys,
    selectedRows,
    handlePageChange,
    handleSearch,
    handleSelectionChange,
  } = useDataTable<Order>({
    collectionName: "orders",
    searchFields: ["customerName", "customerPhone", "id"],
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: any) => {
    const d = date?.toDate?.() || new Date(date)
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUSES.find((s) => s.value === status)
    return <Badge className={statusConfig?.color || "bg-gray-100 text-gray-800"}>{statusConfig?.label || status}</Badge>
  }

  const columns: Column<Order>[] = [
    {
      key: "id",
      title: "Order ID",
      render: (_, record) => <span className="font-mono text-sm">#{record.id.slice(-8).toUpperCase()}</span>,
    },
    {
      key: "customerName",
      title: "Customer",
      render: (_, record) => (
        <div>
          <p className="font-medium text-foreground">{record.customerName}</p>
          <p className="text-sm text-muted-foreground">{record.customerPhone}</p>
        </div>
      ),
    },
    {
      key: "items",
      title: "Items",
      render: (items) => (
        <div className="space-y-1">
          {items.slice(0, 2).map((item: any, index: number) => (
            <div key={index} className="text-sm">
              <span className="font-medium">{item.quantity}x</span> {item.productName}
            </div>
          ))}
          {items.length > 2 && <p className="text-xs text-muted-foreground">+{items.length - 2} more items</p>}
        </div>
      ),
    },
    {
      key: "total",
      title: "Total",
      render: (value) => <span className="font-medium">{formatCurrency(value)}</span>,
    },
    {
      key: "status",
      title: "Status",
      render: (value) => getStatusBadge(value),
    },
    {
      key: "paymentStatus",
      title: "Payment",
      render: (value) => (
        <Badge
          className={
            value === "paid"
              ? "bg-green-100 text-green-800"
              : value === "failed"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
          }
        >
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Date",
      render: (value) => <span className="text-sm text-muted-foreground">{formatDate(value)}</span>,
    },
  ]

  const handleStatusUpdate = async (order: Order, newStatus: Order["status"]) => {
    await onUpdateOrderStatus(order.id, newStatus)
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
  }

  // Quick stats for different order statuses
  const statusStats = ORDER_STATUSES.slice(0, 4).map((status) => {
    const count = orders.filter((order) => order.status === status.value).length
    return { ...status, count }
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
            <p className="text-muted-foreground">Track and manage customer orders in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusStats.map((status) => (
          <Card key={status.value} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{status.label}</p>
                  <p className="text-2xl font-bold text-foreground">{status.count}</p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    status.color.includes("blue")
                      ? "bg-blue-500"
                      : status.color.includes("green")
                        ? "bg-green-500"
                        : status.color.includes("red")
                          ? "bg-red-500"
                          : "bg-gray-500"
                  }`}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <DataTable
        data={orders}
        columns={columns}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          onPageChange: handlePageChange,
        }}
        selection={{
          selectedRowKeys,
          onSelectionChange: handleSelectionChange,
          getRowKey: (record) => record.id,
        }}
        actions={{
          onView: handleViewOrder,
          customActions: [
            {
              key: "status",
              label: "Update Status",
              onClick: (record) => {
                // This would open a status update modal
                console.log("Update status for:", record)
              },
            },
          ],
        }}
        filters={{
          search: {
            placeholder: "Search orders...",
            onSearch: handleSearch,
          },
          customFilters: [
            {
              key: "status",
              label: "Filter by status",
              options: [
                { label: "All Statuses", value: "" },
                ...ORDER_STATUSES.map((status) => ({
                  label: status.label,
                  value: status.value,
                })),
              ],
              onFilter: setStatusFilter,
            },
            {
              key: "date",
              label: "Filter by date",
              options: [
                { label: "All Time", value: "" },
                { label: "Today", value: "today" },
                { label: "Yesterday", value: "yesterday" },
                { label: "This Week", value: "week" },
                { label: "This Month", value: "month" },
              ],
              onFilter: (value) => console.log("Date filter:", value),
            },
          ],
        }}
        toolbar={{
          title: `${orders.length} Orders`,
          description: "Manage customer orders and track delivery status",
        }}
        emptyState={{
          title: "No orders found",
          description: "Orders will appear here once customers start placing them",
        }}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={(status) => handleStatusUpdate(selectedOrder, status)}
        />
      )}
    </div>
  )
}
