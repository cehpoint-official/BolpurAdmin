"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, type Column } from "@/components/ui/data-table"
import { UserForm } from "./user-form"
import { Plus, User } from "lucide-react"
import type { User as UserType } from "@/types"
import { USER_ROLES } from "@/constants"
import { useDataTable } from "@/hooks/use-data-table"

interface UsersManagementProps {
  users: UserType[]
  loading?: boolean
  onCreateUser: (user: Omit<UserType, "id">) => Promise<void>
  onUpdateUser: (id: string, user: Partial<UserType>) => Promise<void>
  onDeleteUser: (id: string) => Promise<void>
}

export function UsersManagement({ users, loading, onCreateUser, onUpdateUser, onDeleteUser }: UsersManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)

  const {
    data: filteredUsers,
    pagination,
    selectedRowKeys,
    selectedRows,
    handlePageChange,
    handleSearch,
    handleSelectionChange,
  } = useDataTable<UserType>({
    collectionName: "users",
    searchFields: ["name", "email", "role"],
  })

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

  const columns: Column<UserType>[] = [
    {
      key: "name",
      title: "User",
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-foreground">{record.name}</p>
            <p className="text-sm text-muted-foreground">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      title: "Role",
      render: (value) => {
        const roleConfig = USER_ROLES.find((r) => r.value === value)
        return (
          <Badge
            className={
              value === "admin"
                ? "bg-blue-100 text-blue-800"
                : value === "manager"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
            }
          >
            {roleConfig?.label || value}
          </Badge>
        )
      },
    },
    {
      key: "managedCategory",
      title: "Category Access",
      render: (value) => <span className="text-sm text-muted-foreground">{value || "All Categories"}</span>,
    },
    {
      key: "isActive",
      title: "Status",
      render: (value) => (
        <Badge className={value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "lastLogin",
      title: "Last Login",
      render: (value) => <span className="text-sm text-muted-foreground">{value ? formatDate(value) : "Never"}</span>,
    },
    {
      key: "createdAt",
      title: "Created",
      render: (value) => <span className="text-sm text-muted-foreground">{formatDate(value)}</span>,
    },
  ]

  const handleEdit = (user: UserType) => {
    setEditingUser(user)
    setShowAddForm(true)
  }

  const handleDelete = async (user: UserType) => {
    if (confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      await onDeleteUser(user.id)
    }
  }

  const handleFormSubmit = async (userData: Omit<UserType, "id">) => {
    if (editingUser) {
      await onUpdateUser(editingUser.id, userData)
    } else {
      await onCreateUser(userData)
    }
    setShowAddForm(false)
    setEditingUser(null)
  }

  const handleFormCancel = () => {
    setShowAddForm(false)
    setEditingUser(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and access control</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2 bg-gradient-to-r from-primary to-accent">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <DataTable
        data={users}
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
          onEdit: handleEdit,
          onDelete: handleDelete,
        }}
        filters={{
          search: {
            placeholder: "Search users...",
            onSearch: handleSearch,
          },
          customFilters: [
            {
              key: "role",
              label: "Filter by role",
              options: [
                { label: "All Roles", value: "" },
                ...USER_ROLES.map((role) => ({
                  label: role.label,
                  value: role.value,
                })),
              ],
              onFilter: (value) => console.log("Role filter:", value),
            },
            {
              key: "status",
              label: "Filter by status",
              options: [
                { label: "All Status", value: "" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ],
              onFilter: (value) => console.log("Status filter:", value),
            },
          ],
        }}
        toolbar={{
          title: `${users.length} Users`,
          description: "Manage system access and user permissions",
        }}
        emptyState={{
          title: "No users found",
          description: "Add users to manage system access and permissions",
          action: (
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First User
            </Button>
          ),
        }}
      />

      {/* User Form Modal */}
      {showAddForm && <UserForm user={editingUser} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />}
    </div>
  )
}
