import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ProductForm } from "./product-form";
import { Plus, Package, AlertTriangle } from "lucide-react";
import type { Product, Vendor, Category, TimeSlot } from "@/types";
import { TIME_SLOTS } from "@/constants";
import { useDataTable } from "@/hooks/use-data-table";

interface ProductsManagementProps {
  products: Product[];
  vendors: Vendor[];
  categories: Category[];
  timeSlots: TimeSlot[];
  loading?: boolean;
  onCreateProduct: (product: Omit<Product, "id">) => Promise<void>;
  onUpdateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
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
}: ProductsManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");

  const {
    data: filteredProducts,
    pagination,
    selectedRowKeys,
    selectedRows,
    handlePageChange,
    handleSearch,
    handleSelectionChange,
  } = useDataTable<Product>({
    collectionName: "products",
    searchFields: ["name", "category", "vendorName"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns: Column<Product>[] = [
    {
      key: "name",
      title: "Product",
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
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "price",
      title: "Price",
      render: (value) => (
        <span className="font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      key: "stock",
      title: "Stock",
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
      render: (value) => (
        <div className="text-sm">
          <p className="font-medium">{value}</p>
        </div>
      ),
    },
    {
      key: "timeSlot",
      title: "Time Slot",
      render: (value) => {
        const slot = TIME_SLOTS.find((s) => s.value === value);
        return (
          <div className="flex items-center gap-1">
            <span>{slot?.icon}</span>
            <span className="text-sm capitalize">{value}</span>
          </div>
        );
      },
    },
    {
      key: "available",
      title: "Status",
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
      await onDeleteProduct(product.id);
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
        data={products}
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
          onView: (record) => console.log("View product:", record),
          onEdit: handleEdit,
          onDelete: handleDelete,
        }}
        filters={{
          search: {
            placeholder: "Search products...",
            onSearch: handleSearch,
          },
          customFilters: [
            {
              key: "category",
              label: "Filter by category",
              options: [
                { label: "All Categories", value: "all" }, // ✅ Changed from "" to "all"
                ...categories
                  .filter((cat) => cat.isActive)
                  .map((cat) => ({
                    label: cat.name,
                    value: cat.name,
                  })),
              ],
              onFilter: (value) => {
                // Handle the "all" value properly
                setCategoryFilter(value === "all" ? "" : value);
              },
            },
          ],
        }}
        emptyState={{
          title: "No products found",
          description:
            "Get started by adding your first product to the catalog",
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
