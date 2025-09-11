import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Timer, Bell, Globe, Shield, CheckCircle } from "lucide-react"
import type { TimeRules } from "@/types"
import { TIME_SLOTS, DEFAULT_CATEGORIES } from "@/constants"

interface SettingsProps {
  timeRules: TimeRules
  onUpdateTimeRules: (rules: TimeRules) => Promise<void>
  loading?: boolean
}

export function Settings({ timeRules, onUpdateTimeRules, loading }: SettingsProps) {
  const [localTimeRules, setLocalTimeRules] = useState<TimeRules>(timeRules)
  const [saving, setSaving] = useState(false)

  const handleTimeRuleChange = (timeSlot: keyof TimeRules, category: string, checked: boolean) => {
    const newRules = { ...localTimeRules }
    if (checked) {
      newRules[timeSlot] = [...newRules[timeSlot], category]
    } else {
      newRules[timeSlot] = newRules[timeSlot].filter((cat) => cat !== category)
    }
    setLocalTimeRules(newRules)
  }

  const handleSaveTimeRules = async () => {
    setSaving(true)
    try {
      await onUpdateTimeRules(localTimeRules)
    } catch (error) {
      console.error("Error saving time rules:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>

        <div className="h-12 bg-muted rounded"></div>

        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <div className="h-6 bg-muted rounded w-32"></div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-6 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground">Configure your admin panel and business rules</p>
      </div>

      <Tabs defaultValue="time-rules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="time-rules">Time Rules</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="time-rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Time-Based Ordering Rules
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure which product categories are available during specific time slots
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {TIME_SLOTS.map((slot) => (
                <div key={slot.value} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{slot.icon}</span>
                    <h3 className="font-semibold text-foreground">{slot.label}</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {DEFAULT_CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`${slot.value}-${category}`}
                          checked={localTimeRules[slot.value as keyof TimeRules]?.includes(category)}
                          onChange={(e) =>
                            handleTimeRuleChange(slot.value as keyof TimeRules, category, e.target.checked)
                          }
                          className="rounded"
                        />
                        <Label htmlFor={`${slot.value}-${category}`} className="text-sm">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-border">
                <Button onClick={handleSaveTimeRules} disabled={saving} className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Time Rules"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Order Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when new orders are placed</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-muted-foreground">Alert when product stock is running low</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Reports</p>
                    <p className="text-sm text-muted-foreground">Receive daily business reports via email</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Third-party Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Payment Gateway</h3>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect your payment processor for seamless transactions
                  </p>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">SMS Service</h3>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Send order updates and notifications via SMS</p>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
