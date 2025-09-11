import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { MapPin, Phone, Package, Clock, CreditCard } from "lucide-react"
import type { Order } from "@/types"
import { ORDER_STATUSES } from "@/constants"

interface OrderDetailsProps {
  order: Order
  onClose: () => void
  onStatusUpdate: (status: Order["status"]) => void
}

export function OrderDetails({ order, onClose, onStatusUpdate }: OrderDetailsProps) {
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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUSES.find((s) => s.value === status)
    return <Badge className={statusConfig?.color || "bg-gray-100 text-gray-800"}>{statusConfig?.label || status}</Badge>
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order #{order.id.slice(-8).toUpperCase()}</span>
            {getStatusBadge(order.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.productName}</h4>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.price)}</p>
                        <p className="text-sm text-muted-foreground">each</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold">{formatCurrency(item.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {order.deliveryFee && (
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee:</span>
                      <span>{formatCurrency(order.deliveryFee)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  {order.status !== "pending" && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Order Confirmed</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.updatedAt || order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === "delivered" && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Order Delivered</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.deliveryTime || order.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer & Order Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-medium text-primary">{order.customerName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">Customer</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{order.customerPhone}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>{order.customerAddress}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Method:</span>
                  <Badge variant="outline">
                    {order.paymentMethod === "cash" ? "Cash on Delivery" : "Online Payment"}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge
                    className={
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-medium">{formatCurrency(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <Select value={order.status} onValueChange={(value) => onStatusUpdate(value as Order["status"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Print Receipt
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Send SMS
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
