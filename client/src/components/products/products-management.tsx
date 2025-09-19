import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ProductForm } from "./product-form";
import { Plus, Package, AlertTriangle, Trash2 } from "lucide-react";
import type { Product, Vendor, Category } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface ProductsManagementProps {
  products: Product[];
  vendors: Vendor[];
  categories: Category[];
  loading?: boolean;
  onCreateProduct: (product: Omit<Product, "id">) => Promise<void>;
  onUpdateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  onUpdateVendor: (id: string, vendor: Partial<Vendor>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

interface ProductWithExportData extends Product {
  categoryNames: string;
  vendorNames: string;
  availableStatus: string;
}

export function ProductsManagement({
  products,
  vendors,
  categories,
  loading,
  onCreateProduct,
  onUpdateProduct,
  onUpdateVendor,
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calculate total products for each vendor
  const calculateVendorProductCounts = () => {
    const vendorCounts: { [vendorId: string]: number } = {};
    
    products.forEach(product => {
      product.vendors.forEach(vendor => {
        vendorCounts[vendor.id] = (vendorCounts[vendor.id] || 0) + 1;
      });
    });
    
    return vendorCounts;
  };

  // Update vendor totalProducts count
  const updateVendorProductCounts = async (affectedVendorIds: string[]) => {
    try {
      const vendorCounts = calculateVendorProductCounts();
      
      const updatePromises = affectedVendorIds.map(async (vendorId) => {
        const count = vendorCounts[vendorId] || 0;
        await onUpdateVendor(vendorId, { totalProducts: count });
      });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating vendor product counts:", error);
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchValue === "" ||
      product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.categories.some((cat) =>
        cat.name.toLowerCase().includes(searchValue.toLowerCase())
      ) ||
      product.vendors.some((vendor) =>
        vendor.name.toLowerCase().includes(searchValue.toLowerCase())
      ) ||
      (product.description &&
        product.description.toLowerCase().includes(searchValue.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" ||
      product.categories.some(cat => cat.name === categoryFilter);

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
      key: "categoryNames",
      title: "Categories",
      exportable: true,
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.categories.map((cat) => (
            <Badge key={cat.id} variant="outline">
              {cat.name}
            </Badge>
          ))}
        </div>
      ),
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
      key: "vendorNames",
      title: "Vendors",
      exportable: true,
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.vendors.map((vendor) => (
            <Badge key={vendor.id} variant="outline" className="text-xs">
              {vendor.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "availableStatus",
      title: "Status",
      exportable: true,
      render: (_, record) => (
        <Badge
          className={
            record.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }
        >
          {record.available ? "Available" : "Unavailable"}
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
        // Get affected vendor IDs before deleting
        const affectedVendorIds = product.vendors.map(vendor => vendor.id);
        
        await onDeleteProduct(product.id);
        
        // Update vendor product counts after deletion
        await updateVendorProductCounts(affectedVendorIds);
        
        if (selectedRowKeys.includes(product.id)) {
          const newSelectedKeys = selectedRowKeys.filter((key) => key !== product.id);
          const newSelectedRows = selectedRows.filter((row) => row.id !== product.id);
          setSelectedRowKeys(newSelectedKeys);
          setSelectedRows(newSelectedRows);
        }
        
        toast({
          title: "Success",
          description: "Product deleted and vendor counts updated",
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        });
      }
    }
  };

  const handleMultipleDelete = async () => {
    if (selectedRows.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedRows.length} selected product(s)? This action cannot be undone.`;

    if (confirm(confirmMessage)) {
      try {
        // Get all affected vendor IDs before deletion
        const allAffectedVendorIds = new Set<string>();
        selectedRows.forEach(product => {
          product.vendors.forEach(vendor => {
            allAffectedVendorIds.add(vendor.id);
          });
        });
        
        await Promise.all(selectedRows.map((product) => onDeleteProduct(product.id)));
        
        // Update vendor product counts after deletion
        await updateVendorProductCounts(Array.from(allAffectedVendorIds));
        
        setSelectedRowKeys([]);
        setSelectedRows([]);
        toast({
          title: "Success",
          description: `${selectedRows.length} product(s) deleted and vendor counts updated`,
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
    try {
      let allAffectedVendorIds = new Set<string>();
      
      // Add new vendor IDs
      productData.vendors.forEach(vendor => {
        allAffectedVendorIds.add(vendor.id);
      });
      
      if (editingProduct) {
        // Add old vendor IDs for update case
        editingProduct.vendors.forEach(vendor => {
          allAffectedVendorIds.add(vendor.id);
        });
        
        await onUpdateProduct(editingProduct.id, productData);
        
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await onCreateProduct(productData);
        
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      
      // Update vendor product counts
      await updateVendorProductCounts(Array.from(allAffectedVendorIds));
      
      setShowAddForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
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

  // Prepare data for export with additional fields
  const exportData: ProductWithExportData[] = filteredProducts.map((product) => ({
    ...product,
    categoryNames: product.categories.map(cat => cat.name).join(", "),
    vendorNames: product.vendors.map(vendor => vendor.name).join(", "),
    availableStatus: product.available ? "Available" : "Unavailable",
  }));

  const totalItems = filteredProducts.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = exportData.slice(startIndex, endIndex);

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
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
          filename: `products-${new Date().toISOString().split("T")[0]}`,
          sheetName: "Products",
          excludeColumns: ["categories", "vendors", "available"],
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
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
