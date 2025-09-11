"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"

export interface Column<T> {
  key: keyof T | string
  title: string
  render?: (value: any, record: T, index: number) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
  align?: "left" | "center" | "right"
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    showSizeChanger?: boolean
    pageSizeOptions?: number[]
    onPageChange: (page: number, pageSize: number) => void
  }
  selection?: {
    selectedRowKeys: string[]
    onSelectionChange: (selectedRowKeys: string[], selectedRows: T[]) => void
    getRowKey: (record: T) => string
  }
  actions?: {
    onView?: (record: T) => void
    onEdit?: (record: T) => void
    onDelete?: (record: T) => void
    customActions?: Array<{
      key: string
      label: string
      icon?: React.ReactNode
      onClick: (record: T) => void
      disabled?: (record: T) => boolean
    }>
  }
  filters?: {
    search?: {
      placeholder?: string
      onSearch: (value: string) => void
    }
    customFilters?: Array<{
      key: string
      label: string
      options: Array<{ label: string; value: string }>
      onFilter: (value: string) => void
    }>
  }
  toolbar?: {
    title?: string
    description?: string
    actions?: React.ReactNode
  }
  emptyState?: {
    title: string
    description: string
    action?: React.ReactNode
  }
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  pagination,
  selection,
  actions,
  filters,
  toolbar,
  emptyState,
  className,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  } | null>(null)

  // Handle sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key]
      const bValue = (b as any)[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        }
      }
      return { key, direction: "asc" }
    })
  }

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (!selection) return

    if (checked) {
      const allKeys = data.map(selection.getRowKey)
      selection.onSelectionChange(allKeys, data)
    } else {
      selection.onSelectionChange([], [])
    }
  }

  const handleSelectRow = (record: T, checked: boolean) => {
    if (!selection) return

    const key = selection.getRowKey(record)
    let newSelectedKeys = [...selection.selectedRowKeys]

    if (checked) {
      newSelectedKeys.push(key)
    } else {
      newSelectedKeys = newSelectedKeys.filter((k) => k !== key)
    }

    const selectedRows = data.filter((item) => newSelectedKeys.includes(selection.getRowKey(item)))

    selection.onSelectionChange(newSelectedKeys, selectedRows)
  }

  // Render skeleton loading
  const renderSkeleton = () => (
    <div className="space-y-4">
      {/* Toolbar skeleton */}
      {toolbar && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      )}

      {/* Filters skeleton */}
      {filters && (
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      )}

      {/* Table skeleton */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {selection && (
                    <TableHead className="w-12">
                      <Skeleton className="h-4 w-4" />
                    </TableHead>
                  )}
                  {columns.map((_, index) => (
                    <TableHead key={index}>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                  ))}
                  {actions && (
                    <TableHead>
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {selection && (
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                    )}
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination skeleton */}
      {pagination && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      )}
    </div>
  )

  // Render empty state
  const renderEmptyState = () => {
    if (!emptyState) return null

    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{emptyState.title}</h3>
            <p className="text-muted-foreground">{emptyState.description}</p>
            {emptyState.action}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render pagination
  const renderPagination = () => {
    if (!pagination) return null

    const { current, pageSize, total, showSizeChanger, pageSizeOptions, onPageChange } = pagination
    const totalPages = Math.ceil(total / pageSize)
    const startItem = (current - 1) * pageSize + 1
    const endItem = Math.min(current * pageSize, total)

    return (
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {total} entries
          </p>

          {showSizeChanger && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select value={pageSize.toString()} onValueChange={(value) => onPageChange(1, Number.parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(pageSizeOptions || [10, 20, 50, 100]).map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onPageChange(1, pageSize)} disabled={current === 1}>
            <ChevronsLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(current - 1, pageSize)}
            disabled={current === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber
              if (totalPages <= 5) {
                pageNumber = i + 1
              } else if (current <= 3) {
                pageNumber = i + 1
              } else if (current >= totalPages - 2) {
                pageNumber = totalPages - 4 + i
              } else {
                pageNumber = current - 2 + i
              }

              return (
                <Button
                  key={pageNumber}
                  variant={current === pageNumber ? "default" : "outline"}
                  size="icon"
                  onClick={() => onPageChange(pageNumber, pageSize)}
                >
                  {pageNumber}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(current + 1, pageSize)}
            disabled={current === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages, pageSize)}
            disabled={current === totalPages}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return renderSkeleton()
  }

  if (data.length === 0) {
    return renderEmptyState()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      {toolbar && (
        <div className="flex items-center justify-between">
          <div>
            {toolbar.title && <h2 className="text-xl font-semibold text-foreground">{toolbar.title}</h2>}
            {toolbar.description && <p className="text-sm text-muted-foreground">{toolbar.description}</p>}
          </div>
          {toolbar.actions}
        </div>
      )}

      {/* Filters */}
      {filters && (
        <div className="flex items-center gap-4 flex-wrap">
          {filters.search && (
            <div className="relative flex-1 min-w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={filters.search.placeholder || "Search..."}
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  filters.search?.onSearch(e.target.value)
                }}
                className="pl-10"
              />
            </div>
          )}

          {filters.customFilters?.map((filter) => (
            <Select key={filter.key} onValueChange={filter.onFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Selection Info */}
      {selection && selection.selectedRowKeys.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">{selection.selectedRowKeys.length} item(s) selected</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Bulk Edit
            </Button>
            <Button variant="outline" size="sm">
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {selection && (
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={data.length > 0 && selection.selectedRowKeys.length === data.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </TableHead>
                  )}

                  {columns.map((column) => (
                    <TableHead
                      key={column.key as string}
                      className={`${column.width ? `w-${column.width}` : ""} ${
                        column.align === "center"
                          ? "text-center"
                          : column.align === "right"
                            ? "text-right"
                            : "text-left"
                      }`}
                    >
                      {column.sortable ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium"
                          onClick={() => handleSort(column.key as string)}
                        >
                          {column.title}
                          {sortConfig?.key === column.key && (
                            <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                          )}
                        </Button>
                      ) : (
                        column.title
                      )}
                    </TableHead>
                  ))}

                  {actions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedData.map((record, index) => {
                  const rowKey = selection?.getRowKey(record) || index.toString()
                  const isSelected = selection?.selectedRowKeys.includes(rowKey) || false

                  return (
                    <TableRow key={rowKey} className={`hover:bg-muted/50 ${isSelected ? "bg-muted/30" : ""}`}>
                      {selection && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(record, e.target.checked)}
                            className="rounded"
                          />
                        </TableCell>
                      )}

                      {columns.map((column) => (
                        <TableCell
                          key={column.key as string}
                          className={
                            column.align === "center"
                              ? "text-center"
                              : column.align === "right"
                                ? "text-right"
                                : "text-left"
                          }
                        >
                          {column.render
                            ? column.render((record as any)[column.key], record, index)
                            : (record as any)[column.key]}
                        </TableCell>
                      ))}

                      {actions && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {actions.onView && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => actions.onView!(record)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}

                            {actions.onEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => actions.onEdit!(record)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}

                            {actions.onDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                onClick={() => actions.onDelete!(record)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}

                            {actions.customActions && actions.customActions.length > 0 && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && <div className="mt-4">{renderPagination()}</div>}
    </div>
  )
}
