"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Users,
  Search,
  Eye,
  UserCheck,
  UserX,
  Star,
  Loader2,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Mail,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: string
  emailVerified: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
  totalBookings: number
  totalOrders: number
  totalSpent: number
}

interface UserDetails extends User {
  totalReviews: number
  totalTips: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    totalAmount: number
    status: string
    createdAt: string
    celebrityName: string
  }>
  celebrityProfile?: {
    id: string
    pricePersonal: number
    priceBusiness: number
    priceCharity: number
    category: string
    rating: number
    totalEarnings: number
    completionRate: number
    isActive: boolean
    verified: boolean
  }
}

interface UserStats {
  totalUsers: number
  verifiedUsers: number
  unverifiedUsers: number
  celebrities: number
  fans: number
  admins: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
  const [userDetailsLoading, setUserDetailsLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", isVerified: false })

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter, pagination.page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (roleFilter !== "all") params.append("role", roleFilter)
      params.append("page", pagination.page.toString())
      params.append("limit", pagination.limit.toString())

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setStats(data.stats)
        setPagination(data.pagination)
      } else {
        toast.error("Failed to fetch users")
      }
    } catch (error) {
      toast.error("Error fetching users")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDetails = async (userId: string) => {
    try {
      setUserDetailsLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedUser(data.user)
      } else {
        toast.error("Failed to fetch user details")
      }
    } catch (error) {
      toast.error("Error fetching user details")
    } finally {
      setUserDetailsLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast.success(`User ${action}d successfully`)
        fetchUsers()
        if (selectedUser?.id === userId) {
          fetchUserDetails(userId)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to ${action} user`)
      }
    } catch (error) {
      toast.error("Error updating user")
    } finally {
      setUpdating(false)
    }
  }

  const handleEditUser = async () => {
    if (!editingUser) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          ...editForm,
        }),
      })

      if (response.ok) {
        toast.success("User updated successfully")
        setEditingUser(null)
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update user")
      }
    } catch (error) {
      toast.error("Error updating user")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("User deleted successfully")
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete user")
      }
    } catch (error) {
      toast.error("Error deleting user")
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { color: "bg-red-500/20 text-red-400 border-red-500/30", text: "Admin" },
      CELEBRITY: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", text: "Celebrity" },
      FAN: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", text: "Fan" },
    }
    const config = roleConfig[role as keyof typeof roleConfig] || {
      color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      text: role,
    }
    return <Badge className={config.color}>{config.text}</Badge>
  }

  const getStatusBadge = (isVerified: boolean, emailVerified: boolean) => {
    if (isVerified && emailVerified) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Verified</Badge>
    } else if (emailVerified) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Email Verified</Badge>
    } else {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Unverified</Badge>
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          User Management
        </h1>
        <p className="text-gray-400">Manage all platform users, roles, and permissions.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { title: "Total Users", value: stats.totalUsers, icon: Users, color: "from-blue-500 to-cyan-500" },
            {
              title: "Verified Users",
              value: stats.verifiedUsers,
              icon: UserCheck,
              color: "from-green-500 to-emerald-500",
            },
            { title: "Celebrities", value: stats.celebrities, icon: Star, color: "from-purple-500 to-pink-500" },
            { title: "Fans", value: stats.fans, icon: Users, color: "from-blue-500 to-indigo-500" },
            { title: "Admins", value: stats.admins, icon: Shield, color: "from-red-500 to-pink-500" },
            { title: "Unverified", value: stats.unverifiedUsers, icon: UserX, color: "from-red-500 to-orange-500" },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-800">
                    All Roles
                  </SelectItem>
                  <SelectItem value="FAN" className="text-white hover:bg-gray-800">
                    Fans
                  </SelectItem>
                  <SelectItem value="CELEBRITY" className="text-white hover:bg-gray-800">
                    Celebrities
                  </SelectItem>
                  <SelectItem value="ADMIN" className="text-white hover:bg-gray-800">
                    Admins
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white">All Users ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="ml-2 text-gray-300">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-800/50">
                      <TableHead className="text-gray-300">User</TableHead>
                      <TableHead className="text-gray-300">Role</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Activity</TableHead>
                      <TableHead className="text-gray-300">Joined</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-gray-700 hover:bg-gray-800/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.name}</p>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.isVerified, user.emailVerified)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-gray-300">{user.totalOrders} orders</p>
                            <p className="text-gray-400">${user.totalSpent.toFixed(2)} spent</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fetchUserDetails(user.id)}
                                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>User Details - {selectedUser?.name}</DialogTitle>
                                  <DialogDescription className="text-gray-400">
                                    View and manage user information
                                  </DialogDescription>
                                </DialogHeader>
                                {userDetailsLoading ? (
                                  <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                                  </div>
                                ) : selectedUser ? (
                                  <div className="space-y-6">
                                    {/* User Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <Card className="bg-gray-800/50 border-gray-700">
                                        <CardHeader>
                                          <CardTitle className="text-lg flex items-center gap-2">
                                            <Users className="w-5 h-5 text-purple-400" />
                                            User Information
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                          <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-300">{selectedUser.email}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-300">
                                              Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-gray-400">Role:</span>
                                            {getRoleBadge(selectedUser.role)}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-gray-400">Status:</span>
                                            {getStatusBadge(selectedUser.isVerified, selectedUser.emailVerified)}
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card className="bg-gray-800/50 border-gray-700">
                                        <CardHeader>
                                          <CardTitle className="text-lg flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-purple-400" />
                                            Activity Stats
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                          <div>
                                            <span className="text-gray-400 text-sm">Total Orders:</span>
                                            <p className="text-white font-semibold">{selectedUser.totalOrders}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 text-sm">Total Bookings:</span>
                                            <p className="text-white font-semibold">{selectedUser.totalBookings}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 text-sm">Total Spent:</span>
                                            <p className="text-white font-semibold">
                                              ${selectedUser.totalSpent.toFixed(2)}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 text-sm">Reviews Given:</span>
                                            <p className="text-white font-semibold">{selectedUser.totalReviews}</p>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Celebrity Profile */}
                                    {selectedUser.celebrityProfile && (
                                      <Card className="bg-gray-800/50 border-gray-700">
                                        <CardHeader>
                                          <CardTitle className="text-lg flex items-center gap-2">
                                            <Star className="w-5 h-5 text-purple-400" />
                                            Celebrity Profile
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                          <div>
                                            <span className="text-gray-400 text-sm">Category:</span>
                                            <p className="text-white">{selectedUser.celebrityProfile.category}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 text-sm">Personal Price:</span>
                                            <p className="text-white">${selectedUser.celebrityProfile.pricePersonal}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 text-sm">Rating:</span>
                                            <p className="text-white">{selectedUser.celebrityProfile.rating}/5</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 text-sm">Completion Rate:</span>
                                            <p className="text-white">
                                              {selectedUser.celebrityProfile.completionRate}%
                                            </p>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Recent Orders */}
                                    {selectedUser.recentOrders.length > 0 && (
                                      <Card className="bg-gray-800/50 border-gray-700">
                                        <CardHeader>
                                          <CardTitle className="text-lg">Recent Orders</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-3">
                                            {selectedUser.recentOrders.map((order) => (
                                              <div
                                                key={order.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                                              >
                                                <div>
                                                  <p className="text-white font-medium">#{order.orderNumber}</p>
                                                  <p className="text-gray-400 text-sm">
                                                    {order.celebrityName} •{" "}
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                  </p>
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-white font-semibold">${order.totalAmount}</p>
                                                  <Badge
                                                    className={
                                                      order.status === "COMPLETED"
                                                        ? "bg-green-500/20 text-green-400"
                                                        : order.status === "PENDING"
                                                          ? "bg-yellow-500/20 text-yellow-400"
                                                          : "bg-gray-500/20 text-gray-400"
                                                    }
                                                  >
                                                    {order.status}
                                                  </Badge>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                      {selectedUser.isVerified ? (
                                        <Button
                                          onClick={() => handleUserAction(selectedUser.id, "unverify")}
                                          disabled={updating}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          {updating ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <UserX className="w-4 h-4" />
                                          )}
                                          Unverify User
                                        </Button>
                                      ) : (
                                        <Button
                                          onClick={() => handleUserAction(selectedUser.id, "verify")}
                                          disabled={updating}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          {updating ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <UserCheck className="w-4 h-4" />
                                          )}
                                          Verify User
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ) : null}
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(user)}
                                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-900 border-gray-700 text-white">
                                <DialogHeader>
                                  <DialogTitle>Edit User - {editingUser?.name}</DialogTitle>
                                  <DialogDescription className="text-gray-400">
                                    Update user information and settings
                                  </DialogDescription>
                                </DialogHeader>
                                {editingUser && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="name" className="text-white">
                                        Name
                                      </Label>
                                      <Input
                                        id="name"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="bg-gray-800 border-gray-600 text-white"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="email" className="text-white">
                                        Email
                                      </Label>
                                      <Input
                                        id="email"
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="bg-gray-800 border-gray-600 text-white"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="role" className="text-white">
                                        Role
                                      </Label>
                                      <Select
                                        value={editForm.role}
                                        onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                                      >
                                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-600">
                                          <SelectItem value="FAN" className="text-white">
                                            Fan
                                          </SelectItem>
                                          <SelectItem value="CELEBRITY" className="text-white">
                                            Celebrity
                                          </SelectItem>
                                          <SelectItem value="ADMIN" className="text-white">
                                            Admin
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id="isVerified"
                                        checked={editForm.isVerified}
                                        onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                                        className="rounded border-gray-600 bg-gray-800"
                                      />
                                      <Label htmlFor="isVerified" className="text-white">
                                        Verified User
                                      </Label>
                                    </div>
                                    <Button
                                      onClick={handleEditUser}
                                      disabled={updating}
                                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    >
                                      {updating ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          Updating...
                                        </>
                                      ) : (
                                        "Update User"
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-gray-900 border-gray-700">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-400">
                                    Are you sure you want to delete {user.name}? This action cannot be undone. Users
                                    with existing bookings cannot be deleted.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-400">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-400">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.pages}
                      className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}