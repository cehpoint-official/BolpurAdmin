import { useState, useEffect, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { LayoutProvider } from "@/components/layout/layout-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Analytics } from "@/components/analytics/analytics";
import { ProductsManagement } from "@/components/products/products-management";
import { VendorsManagement } from "@/components/vendors/vendors-management";
import { OrdersManagement } from "@/components/orders/orders-management";
import { UsersManagement } from "@/components/users/users-management";
import { CategoriesManagement } from "@/components/categories/categories-management";
import { Settings } from "@/components/settings/settings";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { FirebaseService } from "@/services/firebase-service";
import { useToast } from "@/hooks/use-toast";
import type {
  Product,
  Vendor,
  Order,
  User,
  Category,
  TimeRules,
  DashboardMetrics,
  TimeSlot,
} from "@/types";
import { LoginPage } from "./login-page";

function AdminPanelContent() {
  // Auth state
  const { user, loading: authLoading } = useAuth();

  // Layout state
  const [activeView, setActiveView] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [timeRules, setTimeRules] = useState<TimeRules>({});

  // Loading states
  const [loading, setLoading] = useState({
    global: false,
    products: false,
    vendors: false,
    orders: false,
    users: false,
    categories: false,
    timeSlots: false,
  });

  const { toast } = useToast();

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("admin-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("admin-theme", "light");
    }
  }, [darkMode]);

  // Firebase real-time listeners
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Products listener
    const unsubscribeProducts = FirebaseService.subscribeToCollection<Product>(
      "products",
      (productsData) => {
        setProducts(productsData);
        setLoading((prev) => ({ ...prev, products: false }));
      }
    );
    unsubscribers.push(unsubscribeProducts);

    // Vendors listener
    const unsubscribeVendors = FirebaseService.subscribeToCollection<Vendor>(
      "vendors",
      (vendorsData) => {
        setVendors(vendorsData);
        setLoading((prev) => ({ ...prev, vendors: false }));
      }
    );
    unsubscribers.push(unsubscribeVendors);

    // Orders listener
    const unsubscribeOrders = FirebaseService.subscribeToCollection<Order>(
      "orders",
      (ordersData) => {
        setOrders(ordersData);
        setLoading((prev) => ({ ...prev, orders: false }));
      }
    );
    unsubscribers.push(unsubscribeOrders);

    // Users listener
    const unsubscribeUsers = FirebaseService.subscribeToCollection<User>(
      "users",
      (usersData) => {
        setUsers(usersData);
        setLoading((prev) => ({ ...prev, users: false }));
      }
    );
    unsubscribers.push(unsubscribeUsers);

    // Categories listener
    const unsubscribeCategories =
      FirebaseService.subscribeToCollection<Category>(
        "categories",
        (categoriesData) => {
          setCategories(categoriesData);
          setLoading((prev) => ({ ...prev, categories: false }));
        }
      );
    unsubscribers.push(unsubscribeCategories);

    // Time Slots listener
    const unsubscribeTimeSlots =
      FirebaseService.subscribeToCollection<TimeSlot>(
        "timeSlots",
        (timeSlotsData) => {
          setTimeSlots(timeSlotsData);
          setLoading((prev) => ({ ...prev, timeSlots: false }));
        }
      );
    unsubscribers.push(unsubscribeTimeSlots);

    // Load time rules
    FirebaseService.getTimeRules().then(setTimeRules);

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // Dashboard metrics calculation
  const dashboardMetrics = useMemo((): DashboardMetrics => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const todayOrders = orders.filter((order) => {
      const orderDate =
        order.createdAt?.toDate?.() || new Date(order.createdAt);
      return orderDate >= todayStart;
    });

    const thisMonthOrders = orders.filter((order) => {
      const orderDate =
        order.createdAt?.toDate?.() || new Date(order.createdAt);
      return orderDate >= monthStart;
    });

    const lastMonthOrders = orders.filter((order) => {
      const orderDate =
        order.createdAt?.toDate?.() || new Date(order.createdAt);
      return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
    });

    const dailyRevenue = todayOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const pendingOrders = orders.filter((order) =>
      ["pending", "confirmed", "preparing", "ready"].includes(order.status)
    ).length;

    const revenueGrowth =
      lastMonthOrders.length > 0
        ? ((thisMonthOrders.length - lastMonthOrders.length) /
            lastMonthOrders.length) *
          100
        : 0;

    const orderGrowth =
      lastMonthOrders.length > 0
        ? ((thisMonthOrders.length - lastMonthOrders.length) /
            lastMonthOrders.length) *
          100
        : 0;

    return {
      totalOrders: orders.length,
      dailyRevenue,
      totalProducts: products.length,
      pendingOrders,
      orderGrowth,
      revenueGrowth,
    };
  }, [orders, products]);

  // Calculate additional dashboard metrics
  const additionalMetrics = useMemo(() => {
    // Get top category by order count
    const categoryOrderCount: { [key: string]: number } = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          categoryOrderCount[product.category] =
            (categoryOrderCount[product.category] || 0) + item.quantity;
        }
      });
    });

    const topCategory = Object.entries(categoryOrderCount).reduce(
      (max, [category, count]) =>
        count > max.count ? { category, count } : max,
      { category: "N/A", count: 0 }
    );

    // Calculate average order value
    const avgOrderValue =
      orders.length > 0
        ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length
        : 0;

    // Calculate completion rate
    const completionRate =
      orders.length > 0
        ? Math.round(
            (orders.filter((order) => order.status === "delivered").length /
              orders.length) *
              100
          )
        : 0;

    return {
      topCategory: topCategory.category,
      avgOrderValue,
      completionRate,
    };
  }, [orders, products]);

  // Refresh function for dashboard
  const handleRefreshData = async () => {
    setLoading((prev) => ({ ...prev, global: true }));
    try {
      // Force refresh time rules
      const freshTimeRules = await FirebaseService.getTimeRules();
      setTimeRules(freshTimeRules);

      toast({
        title: "Success",
        description: "Dashboard data refreshed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, global: false }));
    }
  };

  // View metrics for topbar
  const viewMetrics = {
    dashboard: "Real-time",
    products: `${products.length} items`,
    vendors: `${vendors.length} vendors`,
    orders: `${orders.length} orders`,
    users: `${users.length} users`,
    analytics: "Business Intelligence",
    settings: "System Configuration",
    categories: `${categories.length} categories`,
  };

  // All CRUD operations remain the same...
  const handleCreateProduct = async (productData: Omit<Product, "id">) => {
    try {
      await FirebaseService.create("products", productData);
      toast({
        title: "Success",
        description: `Product "${productData.name}" added successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateProduct = async (
    id: string,
    productData: Partial<Product>
  ) => {
    try {
      await FirebaseService.update("products", id, productData);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await FirebaseService.delete("products", id);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleCreateVendor = async (vendorData: Omit<Vendor, "id">) => {
    try {
      await FirebaseService.create("vendors", vendorData);
      toast({
        title: "Success",
        description: `Vendor "${vendorData.name}" added successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add vendor",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateVendor = async (
    id: string,
    vendorData: Partial<Vendor>
  ) => {
    try {
      await FirebaseService.update("vendors", id, vendorData);
      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update vendor",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteVendor = async (id: string) => {
    try {
      await FirebaseService.delete("vendors", id);
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vendor",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: Order["status"]
  ) => {
    try {
      await FirebaseService.update("orders", orderId, { status });
      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleCreateUser = async (userData: Omit<User, "id">) => {
    try {
      await FirebaseService.create("users", userData);
      toast({
        title: "Success",
        description: `User "${userData.name}" added successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    try {
      await FirebaseService.update("users", id, userData);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await FirebaseService.delete("users", id);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleCreateCategory = async (categoryData: Omit<Category, "id">) => {
    try {
      await FirebaseService.create("categories", categoryData);
      toast({
        title: "Success",
        description: `Category "${categoryData.name}" added successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add category",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateCategory = async (
    id: string,
    categoryData: Partial<Category>
  ) => {
    try {
      await FirebaseService.update("categories", id, categoryData);
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await FirebaseService.delete("categories", id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleCreateTimeSlot = async (timeSlotData: Omit<TimeSlot, "id">) => {
    try {
      await FirebaseService.create("timeSlots", timeSlotData);
      toast({
        title: "Success",
        description: `Time slot "${timeSlotData.name}" created successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create time slot",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateTimeSlot = async (
    id: string,
    timeSlotData: Partial<TimeSlot>
  ) => {
    try {
      await FirebaseService.update("timeSlots", id, timeSlotData);
      toast({
        title: "Success",
        description: "Time slot updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update time slot",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteTimeSlot = async (id: string) => {
    try {
      await FirebaseService.delete("timeSlots", id);
      toast({
        title: "Success",
        description: "Time slot deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete time slot",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateTimeRules = async (rules: TimeRules) => {
    try {
      await FirebaseService.updateTimeRules(rules);
      setTimeRules(rules);
      toast({
        title: "Success",
        description: "Time rules updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update time rules",
        variant: "destructive",
      });
      throw error;
    }
  };
  const handleRefreshProducts = async () => {
    setLoading((prev) => ({ ...prev, products: true }));
    try {
      // Force refresh products data
      // The real-time listener will automatically update the products
      // You can also manually fetch data if needed
      toast({
        title: "Success",
        description: "Products data refreshed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to refresh products data",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  // Render main content based on active view
  const renderMainContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <Dashboard
            metrics={dashboardMetrics}
            additionalMetrics={additionalMetrics}
            orders={orders}
            currentUser={user!} // Non-null assertion since we check user exists above
            loading={loading.global}
            onViewChange={setActiveView}
            onRefresh={handleRefreshData}
          />
        );
      case "products":
        return (
          <ProductsManagement
            products={products}
            vendors={vendors}
            categories={categories}
            timeSlots={timeSlots}
            loading={loading.products}
            onCreateProduct={handleCreateProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onRefresh={handleRefreshProducts} // Add this line
          />
        );
      case "vendors":
        return (
          <VendorsManagement
            vendors={vendors}
            loading={loading.vendors}
            categories={categories}
            onCreateVendor={handleCreateVendor}
            onUpdateVendor={handleUpdateVendor}
            onDeleteVendor={handleDeleteVendor}
          />
        );
      case "orders":
        return (
          <OrdersManagement
            orders={orders}
            loading={loading.orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        );
      case "users":
        return (
          <UsersManagement
            users={users}
            loading={loading.users}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onRefresh={async () => {
              setLoading((prev) => ({ ...prev, users: true }));
              try {
                // The real-time listener will automatically update
                toast({
                  title: "Success",
                  description: "Users data refreshed successfully",
                });
              } catch (error: any) {
                toast({
                  title: "Error",
                  description: "Failed to refresh users data",
                  variant: "destructive",
                });
              } finally {
                setLoading((prev) => ({ ...prev, users: false }));
              }
            }}
          />
        );
      case "categories":
        return (
          <CategoriesManagement
            categories={categories}
            loading={loading.categories}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      case "analytics":
        return <Analytics loading={loading.global} />;
      case "settings":
        return (
          <Settings
            timeRules={timeRules}
            categories={categories}
            timeSlots={timeSlots}
            onUpdateTimeRules={handleUpdateTimeRules}
            onCreateTimeSlot={handleCreateTimeSlot}
            onUpdateTimeSlot={handleUpdateTimeSlot}
            onDeleteTimeSlot={handleDeleteTimeSlot}
            loading={loading.global}
          />
        );
      default:
        return (
          <Dashboard
            metrics={dashboardMetrics}
            additionalMetrics={additionalMetrics}
            orders={orders}
            currentUser={user!}
            loading={loading.global}
            onViewChange={setActiveView}
            onRefresh={handleRefreshData}
          />
        );
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <LayoutProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          currentUser={user}
          metrics={{
            totalProducts: products.length,
            totalVendors: vendors.length,
            pendingOrders: dashboardMetrics.pendingOrders,
            totalUsers: users.length,
          }}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar
            activeView={activeView}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            pendingNotifications={dashboardMetrics.pendingOrders}
            viewMetrics={viewMetrics}
          />

          <main className="flex-1 overflow-y-auto">{renderMainContent()}</main>
        </div>
      </div>

      <Toaster />
    </LayoutProvider>
  );
}

export default function AdminPanel() {
  return (
    <AuthProvider>
      <AdminPanelContent />
    </AuthProvider>
  );
}
