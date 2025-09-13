import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ProductForm } from "./product-form";
import { Plus, Package, AlertTriangle, Trash2 } from "lucide-react";
import type { Product, Vendor, Category, TimeSlot } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface ProductsManagementProps {
  products: Product[];
  vendors: Vendor[];
  categories: Category[];
  timeSlots: TimeSlot[];
  loading?: boolean;
  onCreateProduct: (product: Omit<Product, "id">) => Promise<void>;
  onUpdateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

// ✅ Create extended interface for export data
interface ProductWithExportData extends Product {
  timeSlotName?: string;
  availableStatus?: string;
}

export function ProductsManagement({
  products,
  vendors,
  categories,
  timeSlots,
  loading,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRefresh,
}: ProductsManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)



  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchValue === "" || 
      product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.category.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.vendorName.toLowerCase().includes(searchValue.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchValue.toLowerCase()));

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  
  const getTimeSlotInfo = (timeSlotId: string) => {
    if (!timeSlotId) return { icon: "⏰", label: "Not Set", name: "Not Set" };
    
    const slot = timeSlots.find(s => s.id === timeSlotId);
    if (!slot) return { icon: "⏰", label: "Unknown", name: "Unknown" };
    
    return { 
      icon: slot.icon || "⏰", 
      label: slot.label || slot.name, 
      name: slot.name 
    };
  };

  // ✅ Updated columns with proper data handling
  const columns: Column<ProductWithExportData>[] = [
    {
      key: "name",
      title: "Product Name",
      exportable: true,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
            {record.imageUrl ? (
              <img
                src={record.imageUrl}
                alt={record.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{record.name}</p>
            {record.description && (
              <p className="text-sm text-muted-foreground truncate max-w-xs">
                {record.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      title: "Category",
      exportable: true,
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "price",
      title: "Price (₹)",
      exportable: true,
      render: (value) => (
        <span className="font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      key: "stock",
      title: "Stock",
      exportable: true,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <span
            className={`${value < 10 ? "text-red-600" : "text-foreground"}`}
          >
            {value}
          </span>
          {value < 10 && <AlertTriangle className="w-4 h-4 text-red-500" />}
        </div>
      ),
    },
    {
      key: "vendorName",
      title: "Vendor",
      exportable: true,
      render: (value) => (
        <div className="text-sm">
          <p className="font-medium">{value}</p>
        </div>
      ),
    },
    {
      key: "timeSlotId",
      title: "Time Slot",
      exportable: false,
      render: (value) => {
        const slotInfo = getTimeSlotInfo(value);
        return (
          <div className="flex items-center gap-1">
            <span>{slotInfo.icon}</span>
            <span className="text-sm capitalize">{slotInfo.label}</span>
          </div>
        );
      },
    },
    {
      key: "available",
      title: "Status",
      exportable: false, 
      render: (value) => (
        <Badge
          className={
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }
        >
          {value ? "Available" : "Unavailable"}
        </Badge>
      ),
    },
  ];

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDelete = async (product: Product) => {
    if (
      confirm(
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await onDeleteProduct(product.id);
        if (selectedRowKeys.includes(product.id)) {
          const newSelectedKeys = selectedRowKeys.filter(key => key !== product.id);
          const newSelectedRows = selectedRows.filter(row => row.id !== product.id);
          setSelectedRowKeys(newSelectedKeys);
          setSelectedRows(newSelectedRows);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleMultipleDelete = async () => {
    if (selectedRows.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedRows.length} selected product(s)? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      try {
        await Promise.all(selectedRows.map(product => onDeleteProduct(product.id)));
        setSelectedRowKeys([]);
        setSelectedRows([]);
        toast({
          title: "Success",
          description: `${selectedRows.length} product(s) deleted successfully`,
        });
      } catch (error) {
        console.error("Error deleting products:", error);
        toast({
          title: "Error",
          description: "Failed to delete some products",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormSubmit = async (productData: Omit<Product, "id">) => {
    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, productData);
    } else {
      await onCreateProduct(productData);
    }
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleSelectionChange = (keys: string[], rows: ProductWithExportData[]) => {
    setSelectedRowKeys(keys);
    setSelectedRows(rows as Product[]);
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      try {
        await onRefresh();
        toast({
          title: "Success",
          description: "Products data refreshed successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to refresh data",
          variant: "destructive",
        });
      }
    }
  };

  //  Prepare data for export with additional fields
  const exportData: ProductWithExportData[] = filteredProducts.map(product => ({
    ...product,
    timeSlotName: getTimeSlotInfo(product.timeSlotId).name,
    availableStatus: product.available ? "Available" : "Unavailable",
  }));
  const totalItems = filteredProducts.length
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = exportData.slice(startIndex, endIndex)

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page)
    setPageSize(size)
  }
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Product Management
          </h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Data Table */}
       <DataTable
        data={paginatedData} 
        columns={columns}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50, 100],
          onPageChange: handlePageChange,
        }}
        selection={{
          selectedRowKeys,
          onSelectionChange: handleSelectionChange,
          getRowKey: (record) => record.id,
        }}
        actions={{
          onEdit: (record) => handleEdit(record as Product),
          onDelete: (record) => handleDelete(record as Product),
        }}
        filters={{
          search: {
            placeholder: "Search products by name, category, vendor...",
            onSearch: handleSearch,
          },
          customFilters: [
            {
              key: "category",
              label: "Filter by category",
              options: [
                { label: "All Categories", value: "all" },
                ...categories
                  .filter((cat) => cat.isActive)
                  .map((cat) => ({
                    label: cat.name,
                    value: cat.name,
                  })),
              ],
              onFilter: (value) => {
                setCategoryFilter(value);
                setCurrentPage(1); 
              },
            },
          ],
        }}
        toolbar={{
          selectedActions: selectedRowKeys.length > 0 ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleMultipleDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedRowKeys.length})
            </Button>
          ) : undefined,
        }}
        exportConfig={{
          filename: `products-${new Date().toISOString().split('T')[0]}`,
          sheetName: "Products",
          excludeColumns: ["timeSlotId", "available"],
        }}
        onRefresh={handleRefresh}
        originalDataLength={products.length}
        hasActiveFilters={searchValue !== "" || categoryFilter !== "all"}
        emptyState={{
          title: "No products found",
          description: "Get started by adding your first product to the catalog",
          action: (
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Product
            </Button>
          ),
        }}
      />

      {/* Product Form Modal */}
      {showAddForm && (
        <ProductForm
          product={editingProduct}
          vendors={vendors}
          categories={categories}
          timeSlots={timeSlots}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}