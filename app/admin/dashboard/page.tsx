"use client";

import { AdminApplications } from "@/components/admin/admin-applications";
import AdminContentManagement from "@/components/admin/admin-content-management";
import AdminPlatformFees from "@/components/admin/admin-platform-fees";
import AdminServiceManagement from "@/components/admin/admin-service-management";
import AuthRedirect from "@/components/auth-redirect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Activity,
  ArrowUpRight,
  Calendar,
  Crown,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SubtleLuxuryStarfield = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black" />
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <div
              className={`w-1 h-1 rounded-full ${
                Math.random() > 0.97
                  ? "bg-yellow-400 shadow-lg shadow-yellow-400/50"
                  : Math.random() > 0.93
                  ? "bg-purple-400 shadow-lg shadow-purple-400/50"
                  : "bg-white/60"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const mockStats = {
  totalUsers: 1247,
  totalCelebrities: 89,
  totalOrders: 3421,
  totalRevenue: 125000,
  celebrityGrowth: 12.5,
  userGrowth: 8.2,
  orderGrowth: 15.7,
  revenueGrowth: 23.1,
};

const mockRecentUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "USER",
    status: "active",
    joined: "2 hours ago",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "CELEBRITY",
    status: "pending",
    joined: "4 hours ago",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "USER",
    status: "active",
    joined: "6 hours ago",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "CELEBRITY",
    status: "active",
    joined: "1 day ago",
  },
];

const mockRecentBookings = [
  {
    id: 1,
    customer: "John Doe",
    celebrity: "Emma Stone",
    amount: 249,
    status: "CONFIRMED",
    date: "2 hours ago",
  },
  {
    id: 2,
    customer: "Jane Smith",
    celebrity: "Ryan Reynolds",
    amount: 799,
    status: "PENDING",
    date: "4 hours ago",
  },
  {
    id: 3,
    customer: "Mike Johnson",
    celebrity: "Tony Robbins",
    amount: 899,
    status: "COMPLETED",
    date: "1 day ago",
  },
  {
    id: 4,
    customer: "Sarah Wilson",
    celebrity: "Oprah Winfrey",
    amount: 1999,
    status: "CANCELLED",
    date: "2 days ago",
  },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(mockStats);
  const [recentUsers, setRecentUsers] = useState(mockRecentUsers);
  const [recentBookings, setRecentBookings] = useState(mockRecentBookings);
  const [dataLoading, setDataLoading] = useState(true);

  // Settings states
  const [siteSettings, setSiteSettings] = useState({
    siteName: "Kia Ora Kahi",
    siteDescription: "Connect with celebrities for personalized video messages",
    contactEmail: "admin@kiaora.com",
  });
  const [financialSettings, setFinancialSettings] = useState({
    platformFee: 20,
    minimumPayout: 50,
    payoutSchedule: "weekly",
  });

  // User management states
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  // Add User Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "FAN",
  });

  // User Management Modal states
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "FAN",
  });

  // Booking Management Modal states
  const [showViewBookingModal, setShowViewBookingModal] = useState(false);
  const [showEditBookingModal, setShowEditBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [editBooking, setEditBooking] = useState({
    status: "PENDING",
  });

  const fetchAdminData = async () => {
    try {
      setDataLoading(true);
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentUsers(data.recentUsers);
        setRecentBookings(data.recentBookings);
      } else {
        console.error("Failed to fetch admin data");
        toast.error("Failed to load admin data");
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Error loading admin data");
    } finally {
      setDataLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams();
      if (userSearch) params.append("search", userSearch);
      if (userRoleFilter !== "all") params.append("role", userRoleFilter);
      params.append("limit", "100");

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.users);
      } else {
        console.error("Failed to fetch users");
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error loading users");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.role === "ADMIN") {
      fetchAdminData();
      fetchUsers();
    }
  }, [session, status]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [userSearch, userRoleFilter]);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchAdminData().finally(() => {
      setIsLoading(false);
      toast.success("Data refreshed successfully");
    });
  };

  const handleExport = async () => {
    const loadingToast = toast.loading("Generating PDF report...");

    try {
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text("Kia Ora - Admin Report", 20, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

      let yPosition = 50;

      doc.setFontSize(16);
      doc.text("Dashboard Overview", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.text(`Total Users: ${stats.totalUsers}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Total Celebrities: ${stats.totalCelebrities}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Total Orders: ${stats.totalOrders}`, 20, yPosition);
      yPosition += 7;
      doc.text(
        `Total Revenue: $${new Intl.NumberFormat("en-US").format(
          stats.totalRevenue
        )}`,
        20,
        yPosition
      );
      yPosition += 7;
      doc.text(`User Growth: ${stats.userGrowth}%`, 20, yPosition);
      yPosition += 7;
      doc.text(`Celebrity Growth: ${stats.celebrityGrowth}%`, 20, yPosition);
      yPosition += 7;
      doc.text(`Order Growth: ${stats.orderGrowth}%`, 20, yPosition);
      yPosition += 7;
      doc.text(`Revenue Growth: ${stats.revenueGrowth}%`, 20, yPosition);
      yPosition += 15;

      doc.setFontSize(16);
      doc.text("Users List", 20, yPosition);
      yPosition += 10;

      if (recentUsers.length > 0) {
        const userData = [];
        for (const user of recentUsers) {
          userData.push([
            user.name || "",
            user.email || "",
            user.role || "",
            user.status || "",
            user.joined || "",
          ]);
        }

        autoTable(doc, {
          startY: yPosition,
          head: [["Name", "Email", "Role", "Status", "Joined"]],
          body: userData,
          theme: "grid",
          headStyles: { fillColor: [128, 90, 213] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.text("No users found", 20, yPosition);
        yPosition += 10;
      }

      doc.setFontSize(16);
      doc.text("Recent Bookings", 20, yPosition);
      yPosition += 10;

      if (recentBookings.length > 0) {
        const bookingData = [];
        for (const booking of recentBookings) {
          bookingData.push([
            booking.customer || "",
            booking.celebrity || "",
            `$${booking.amount || 0}`,
            booking.status || "",
            booking.date || "",
          ]);
        }

        autoTable(doc, {
          startY: yPosition,
          head: [["Customer", "Celebrity", "Amount", "Status", "Date"]],
          body: bookingData,
          theme: "grid",
          headStyles: { fillColor: [128, 90, 213] },
        });
      } else {
        doc.text("No recent bookings found", 20, yPosition);
      }

      doc.save(
        `kia-ora-admin-report-${new Date().toISOString().split("T")[0]}.pdf`
      );

      // Dismiss the loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("PDF report generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Dismiss the loading toast and show error
      toast.dismiss(loadingToast);
      toast.error("Failed to generate PDF report");
    }
  };

  const exportBookingsData = async () => {
    const loadingToast = toast.loading("Generating PDF report...");

    try {
      // Fetch all bookings data
      const response = await fetch("/api/admin/bookings");
      if (!response.ok) {
        throw new Error("Failed to fetch bookings data");
      }

      const data = await response.json();

      console.log("bookings :", data);

      const bookings = data.bookings || [];

      if (bookings.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("No bookings data to export");
        return;
      }

      // Create PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.setTextColor(75, 0, 130); // Purple color
      doc.text("Kia Ora - Bookings Report", 20, 20);

      // Add subtitle
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`Total Bookings: ${bookings.length}`, 20, 40);

      // Prepare data for table
      const tableData = bookings.map((booking: any) => [
        booking.orderNumber || "",
        booking.customer?.name || "",
        booking.celebrity?.name || "",
        booking.amount ? `$${booking.amount}` : "",
        booking.status || "",
        booking.paymentStatus || "",
        booking.createdAt
          ? new Date(booking.createdAt).toLocaleDateString()
          : "",
      ]);

      // Add table
      autoTable(doc, {
        head: [
          [
            "Order #",
            "Customer",
            "Celebrity",
            "Amount",
            "Status",
            "Payment",
            "Created",
          ],
        ],
        body: tableData,
        startY: 50,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [75, 0, 130], // Purple header
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Order #
          1: { cellWidth: 30 }, // Customer
          2: { cellWidth: 30 }, // Celebrity
          3: { cellWidth: 20 }, // Amount
          4: { cellWidth: 25 }, // Status
          5: { cellWidth: 25 }, // Payment
          6: { cellWidth: 25 }, // Created
        },
        margin: { top: 50, right: 20, bottom: 20, left: 20 },
        didDrawPage: function (data) {
          // Add page numbers
          const pageCount = doc.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        },
      });

      // Add summary at the bottom
      const finalY = (doc as any).lastAutoTable.finalY || 50;
      doc.setFontSize(10);
      doc.setTextColor(75, 0, 130);
      doc.text("Summary:", 20, finalY + 20);

      const totalAmount = bookings.reduce(
        (sum: number, booking: any) => sum + (booking.amount || 0),
        0
      );
      const completedBookings = bookings.filter(
        (booking: any) => booking.status === "COMPLETED"
      ).length;
      const pendingBookings = bookings.filter(
        (booking: any) => booking.status === "PENDING"
      ).length;
      const confirmedBookings = bookings.filter(
        (booking: any) => booking.status === "CONFIRMED"
      ).length;
      const cancelledBookings = bookings.filter(
        (booking: any) => booking.status === "CANCELLED"
      ).length;

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Total Revenue: $${totalAmount.toLocaleString()}`,
        20,
        finalY + 30
      );
      doc.text(`Completed Bookings: ${completedBookings}`, 20, finalY + 40);
      doc.text(`Pending Bookings: ${pendingBookings}`, 20, finalY + 50);
      doc.text(`Confirmed Bookings: ${confirmedBookings}`, 20, finalY + 60);
      doc.text(`Cancelled Bookings: ${cancelledBookings}`, 20, finalY + 70);

      // Add payment status breakdown
      const paidBookings = bookings.filter(
        (booking: any) => booking.paymentStatus === "PAID"
      ).length;
      const unpaidBookings = bookings.filter(
        (booking: any) => booking.paymentStatus === "PENDING"
      ).length;
      const failedBookings = bookings.filter(
        (booking: any) => booking.paymentStatus === "FAILED"
      ).length;

      doc.text(`Paid Bookings: ${paidBookings}`, 120, finalY + 30);
      doc.text(`Unpaid Bookings: ${unpaidBookings}`, 120, finalY + 40);
      doc.text(`Failed Payments: ${failedBookings}`, 120, finalY + 50);

      // Save PDF
      doc.save(
        `kia-ora-bookings-${new Date().toISOString().split("T")[0]}.pdf`
      );

      toast.dismiss(loadingToast);
      toast.success(`PDF report generated successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to generate PDF report");
    }
  };

  const handleSaveSiteSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ siteSettings }),
      });

      if (response.ok) {
        toast.success("Site settings saved successfully");
      } else {
        const error = await response.json();
        console.error("Site settings save error:", error);
        if (response.status === 401) {
          toast.error("Authentication required. Please login again.");
          router.push("/admin/login");
        } else {
          toast.error(error.error || "Failed to save site settings");
        }
      }
    } catch (error) {
      console.error("Error saving site settings:", error);
      toast.error("Error saving site settings");
    }
  };

  const handleSaveFinancialSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ financialSettings }),
      });

      if (response.ok) {
        toast.success("Financial settings saved successfully");
      } else {
        const error = await response.json();
        console.error("Financial settings save error:", error);
        if (response.status === 401) {
          toast.error("Authentication required. Please login again.");
          router.push("/admin/login");
        } else {
          toast.error(error.error || "Failed to save financial settings");
        }
      }
    } catch (error) {
      console.error("Error saving financial settings:", error);
      toast.error("Error saving financial settings");
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        toast.success("User added successfully");
        setShowAddUserModal(false);
        setNewUser({ name: "", email: "", password: "", role: "FAN" });
        fetchUsers(); // Refresh the users list
      } else {
        const error = await response.json();
        console.error("Add user error:", error);
        if (response.status === 401) {
          toast.error("Authentication required. Please login again.");
          router.push("/admin/login");
        } else {
          toast.error(error.error || "Failed to add user");
        }
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Error adding user");
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowViewUserModal(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editUser),
      });

      if (response.ok) {
        toast.success("User updated successfully");
        setShowEditUserModal(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the users list
      } else {
        const error = await response.json();
        console.error("Update user error:", error);
        if (response.status === 401) {
          toast.error("Authentication required. Please login again.");
          router.push("/admin/login");
        } else {
          toast.error(error.error || "Failed to update user");
        }
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error updating user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("User deleted successfully");
        fetchUsers(); // Refresh the users list
      } else {
        const error = await response.json();
        console.error("Delete user error:", error);
        if (response.status === 401) {
          toast.error("Authentication required. Please login again.");
          router.push("/admin/login");
        } else {
          toast.error(error.error || "Failed to delete user");
        }
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
    }
  };

  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setShowViewBookingModal(true);
  };

  const handleEditBooking = (booking: any) => {
    setSelectedBooking(booking);
    setEditBooking({
      status: booking.status,
    });
    setShowEditBookingModal(true);
  };

  const handleUpdateBookingStatus = async () => {
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedBooking.id,
          action: "updateBookingStatus",
          data: { status: editBooking.status },
        }),
      });

      if (response.ok) {
        toast.success("Booking status updated successfully");
        setShowEditBookingModal(false);
        setSelectedBooking(null);

        // Update the local state immediately for better UX
        setRecentBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === selectedBooking.id
              ? { ...booking, status: editBooking.status }
              : booking
          )
        );

        fetchAdminData(); // Refresh the data
      } else {
        const error = await response.json();
        console.error("Update booking error:", error);
        if (response.status === 401) {
          toast.error("Authentication required. Please login again.");
          router.push("/admin/login");
        } else {
          toast.error(error.error || "Failed to update booking status");
        }
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Error updating booking status");
    }
  };

  return (
    <AuthRedirect requiredRole="ADMIN">
      <div className="min-h-screen bg-black overflow-hidden relative">
        <SubtleLuxuryStarfield />

        <div className="relative z-10">
          <div className="bg-black/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-purple-200 mt-1 text-sm sm:text-base">
                    Welcome back, {session.user?.name}
                  </p>
                </div>
                <div className="flex flex-row sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <RefreshCw
                      className={`w-4 h-4 sm:mr-2 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                  <Button
                    onClick={handleExport}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export Data</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => signOut({ callbackUrl: "/admin/login" })}
                    size="sm"
                    className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                  >
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4 sm:space-y-6"
            >
              <TabsList className="flex overflow-x-auto scrollbar-hide bg-white/10 border-white/20 h-auto p-1 gap-1 sm:gap-2">
                <TabsTrigger
                  value="overview"
                  className="text-white data-[state=active]:bg-purple-500 text-xs sm:text-sm p-2 sm:p-3 flex-shrink-0 whitespace-nowrap"
                >
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="text-white data-[state=active]:bg-purple-500 text-xs sm:text-sm p-2 sm:p-3 flex-shrink-0 whitespace-nowrap"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="text-white data-[state=active]:bg-purple-500 text-xs sm:text-sm p-2 sm:p-3 flex-shrink-0 whitespace-nowrap"
                >
                  <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Applications</span>
                </TabsTrigger>
                <TabsTrigger
                  value="bookings"
                  className="text-white data-[state=active]:bg-purple-500 text-xs sm:text-sm p-2 sm:p-3 flex-shrink-0 whitespace-nowrap"
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Bookings</span>
                </TabsTrigger>
                <TabsTrigger
                  value="platform-fees"
                  className="text-white data-[state=active]:bg-purple-500 text-xs sm:text-sm p-2 sm:p-3 flex-shrink-0 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Platform Fees</span>
                </TabsTrigger>
                <TabsTrigger
                  value="content-management"
                  className="text-white data-[state=active]:bg-purple-500 text-xs sm:text-sm p-2 sm:p-3 flex-shrink-0 whitespace-nowrap"
                >
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Content</span>
                </TabsTrigger>
                <TabsTrigger
                  value="service-management"
                  className="text-white data-[state=active]:bg-purple-500 text-xs sm:text-sm p-2 sm:p-3 flex-shrink-0 whitespace-nowrap"
                >
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Services</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-white/80">
                        Total Users
                      </CardTitle>
                      <Users className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {dataLoading
                          ? "..."
                          : stats.totalUsers.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-green-400 mt-1">
                        <ArrowUpRight className="w-3 h-3 mr-1" />+
                        {dataLoading ? "..." : stats.userGrowth}% from last
                        month
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-white/80">
                        Celebrities
                      </CardTitle>
                      <Crown className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {dataLoading ? "..." : stats.totalCelebrities}
                      </div>
                      <div className="flex items-center text-xs text-green-400 mt-1">
                        <ArrowUpRight className="w-3 h-3 mr-1" />+
                        {dataLoading ? "..." : stats.celebrityGrowth}% from last
                        month
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-white/80">
                        Total Orders
                      </CardTitle>
                      <ShoppingCart className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {dataLoading
                          ? "..."
                          : stats.totalOrders.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-green-400 mt-1">
                        <ArrowUpRight className="w-3 h-3 mr-1" />+
                        {dataLoading ? "..." : stats.orderGrowth}% from last
                        month
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-white/80">
                        Total Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        $
                        {dataLoading
                          ? "..."
                          : stats.totalRevenue.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-green-400 mt-1">
                        <ArrowUpRight className="w-3 h-3 mr-1" />+
                        {dataLoading ? "..." : stats.revenueGrowth}% from last
                        month
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white text-lg sm:text-xl">
                        Recent Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      {dataLoading ? (
                        <div className="text-center py-4">
                          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-purple-300 text-sm">
                            Loading users...
                          </p>
                        </div>
                      ) : recentUsers.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-purple-300 text-sm">
                            No recent users
                          </p>
                        </div>
                      ) : (
                        recentUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                          >
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white font-medium text-sm sm:text-base truncate">
                                  {user.name}
                                </p>
                                <p className="text-purple-300 text-xs sm:text-sm truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                              <Badge
                                variant={
                                  user.role === "CELEBRITY"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  user.role === "CELEBRITY"
                                    ? "bg-yellow-500/20 text-yellow-300 text-xs"
                                    : "bg-purple-500/20 text-purple-300 text-xs"
                                }
                              >
                                {user.role}
                              </Badge>
                              <Badge
                                variant={
                                  user.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  user.status === "active"
                                    ? "bg-green-500/20 text-green-300 text-xs"
                                    : "bg-orange-500/20 text-orange-300 text-xs"
                                }
                              >
                                {user.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white text-lg sm:text-xl">
                        Recent Bookings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      {dataLoading ? (
                        <div className="text-center py-4">
                          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-purple-300 text-sm">
                            Loading bookings...
                          </p>
                        </div>
                      ) : recentBookings.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-purple-300 text-sm">
                            No recent bookings
                          </p>
                        </div>
                      ) : (
                        recentBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white/5 rounded-lg space-y-2 sm:space-y-0"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-white font-medium text-sm sm:text-base truncate">
                                {booking.customer} → {booking.celebrity}
                              </p>
                              <p className="text-purple-300 text-xs sm:text-sm">
                                ${booking.amount} • {booking.date}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`text-xs flex-shrink-0 ${
                                booking.status === "CONFIRMED"
                                  ? "bg-green-500/20 text-green-300"
                                  : booking.status === "PENDING"
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : booking.status === "COMPLETED"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-red-500/20 text-red-300"
                              }`}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4 sm:space-y-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <CardTitle className="text-white text-lg sm:text-xl">
                        User Management
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full sm:w-auto pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-purple-300 focus:border-purple-500 text-sm"
                          />
                        </div>
                        <select
                          value={userRoleFilter}
                          onChange={(e) => setUserRoleFilter(e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 text-sm"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            color: "white",
                          }}
                        >
                          <option
                            value="all"
                            style={{
                              backgroundColor: "#1a1a1a",
                              color: "white",
                            }}
                          >
                            All Roles
                          </option>
                          <option
                            value="FAN"
                            style={{
                              backgroundColor: "#1a1a1a",
                              color: "white",
                            }}
                          >
                            Fans
                          </option>
                          <option
                            value="CELEBRITY"
                            style={{
                              backgroundColor: "#1a1a1a",
                              color: "white",
                            }}
                          >
                            Celebrities
                          </option>
                          <option
                            value="ADMIN"
                            style={{
                              backgroundColor: "#1a1a1a",
                              color: "white",
                            }}
                          >
                            Admins
                          </option>
                        </select>
                        <Button
                          onClick={() => setShowAddUserModal(true)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Add User</span>
                          <span className="sm:hidden">Add</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {usersLoading ? (
                        <div className="text-center py-8">
                          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-purple-300">Loading users...</p>
                        </div>
                      ) : allUsers.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-purple-300">No users found</p>
                        </div>
                      ) : (
                        allUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg space-y-3 sm:space-y-0"
                          >
                            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-sm sm:text-base">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white font-medium text-sm sm:text-base truncate">
                                  {user.name}
                                </p>
                                <p className="text-purple-300 text-xs sm:text-sm truncate">
                                  {user.email}
                                </p>
                                <p className="text-purple-400 text-xs">
                                  Joined{" "}
                                  {new Date(user.joined).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={
                                    user.role === "CELEBRITY"
                                      ? "default"
                                      : user.role === "ADMIN"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className={`text-xs ${
                                    user.role === "CELEBRITY"
                                      ? "bg-yellow-500/20 text-yellow-300"
                                      : user.role === "ADMIN"
                                      ? "bg-red-500/20 text-red-300"
                                      : "bg-purple-500/20 text-purple-300"
                                  }`}
                                >
                                  {user.role}
                                </Badge>
                                <Badge
                                  variant={
                                    user.status === "verified"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={`text-xs ${
                                    user.status === "verified"
                                      ? "bg-green-500/20 text-green-300"
                                      : "bg-orange-500/20 text-orange-300"
                                  }`}
                                >
                                  {user.status}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white/60 hover:text-white p-1 sm:p-2"
                                  onClick={() => handleViewUser(user)}
                                >
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white/60 hover:text-white p-1 sm:p-2"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 p-1 sm:p-2"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4 sm:space-y-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                      <CardTitle className="text-white text-lg sm:text-xl">
                        Booking Oversight
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <Button
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm"
                          size="sm"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                        <Button
                          onClick={exportBookingsData}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Export PDF</span>
                          <span className="sm:hidden">Export</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {dataLoading ? (
                        <div className="text-center py-8">
                          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-purple-300">Loading bookings...</p>
                        </div>
                      ) : recentBookings.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-purple-300">No bookings found</p>
                        </div>
                      ) : (
                        recentBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg space-y-3 sm:space-y-0"
                          >
                            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-sm sm:text-base">
                                  {booking.customer.charAt(0)}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white font-medium text-sm sm:text-base truncate">
                                  {booking.customer} → {booking.celebrity}
                                </p>
                                <p className="text-purple-300 text-xs sm:text-sm">
                                  ${booking.amount} • {booking.date}
                                </p>
                                <p className="text-purple-300 text-xs">
                                  ID: {booking.id}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  booking.status === "CONFIRMED"
                                    ? "bg-green-500/20 text-green-300"
                                    : booking.status === "PENDING"
                                    ? "bg-yellow-500/20 text-yellow-300"
                                    : booking.status === "COMPLETED"
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "bg-red-500/20 text-red-300"
                                }`}
                              >
                                {booking.status}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white/60 hover:text-white p-1 sm:p-2"
                                  onClick={() => handleViewBooking(booking)}
                                >
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white/60 hover:text-white p-1 sm:p-2"
                                  onClick={() => handleEditBooking(booking)}
                                >
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="platform-fees"
                className="space-y-4 sm:space-y-6"
              >
                <AdminPlatformFees />
              </TabsContent>

              <TabsContent
                value="applications"
                className="space-y-4 sm:space-y-6"
              >
                <AdminApplications />
              </TabsContent>

              <TabsContent
                value="content-management"
                className="space-y-4 sm:space-y-6"
              >
                <AdminContentManagement />
              </TabsContent>

              <TabsContent
                value="service-management"
                className="space-y-4 sm:space-y-6"
              >
                <AdminServiceManagement />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white text-lg sm:text-xl">
                        Site Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-white/80">
                          Site Name
                        </label>
                        <input
                          type="text"
                          value={siteSettings.siteName}
                          onChange={(e) =>
                            setSiteSettings({
                              ...siteSettings,
                              siteName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-white/80">
                          Site Description
                        </label>
                        <textarea
                          value={siteSettings.siteDescription}
                          onChange={(e) =>
                            setSiteSettings({
                              ...siteSettings,
                              siteDescription: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 text-sm sm:text-base"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-white/80">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={siteSettings.contactEmail}
                          onChange={(e) =>
                            setSiteSettings({
                              ...siteSettings,
                              contactEmail: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 text-sm sm:text-base"
                        />
                      </div>
                      <Button
                        onClick={handleSaveSiteSettings}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm sm:text-base"
                      >
                        Save Site Settings
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white text-lg sm:text-xl">
                        Financial Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-white/80">
                          Platform Fee (%)
                        </label>
                        <input
                          type="number"
                          value={financialSettings.platformFee}
                          onChange={(e) =>
                            setFinancialSettings({
                              ...financialSettings,
                              platformFee: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-white/80">
                          Minimum Payout ($)
                        </label>
                        <input
                          type="number"
                          value={financialSettings.minimumPayout}
                          onChange={(e) =>
                            setFinancialSettings({
                              ...financialSettings,
                              minimumPayout: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-white/80">
                          Payout Schedule
                        </label>
                        <select
                          value={financialSettings.payoutSchedule}
                          onChange={(e) =>
                            setFinancialSettings({
                              ...financialSettings,
                              payoutSchedule: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 text-sm sm:text-base"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            color: "white",
                          }}
                        >
                          <option
                            value="weekly"
                            style={{
                              backgroundColor: "#1a1a1a",
                              color: "white",
                            }}
                          >
                            Weekly
                          </option>
                          <option
                            value="biweekly"
                            style={{
                              backgroundColor: "#1a1a1a",
                              color: "white",
                            }}
                          >
                            Bi-weekly
                          </option>
                          <option
                            value="monthly"
                            style={{
                              backgroundColor: "#1a1a1a",
                              color: "white",
                            }}
                          >
                            Monthly
                          </option>
                        </select>
                      </div>
                      <Button
                        onClick={handleSaveFinancialSettings}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm sm:text-base"
                      >
                        Update Financial Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                Add New User
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500"
                    placeholder="Enter user name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500"
                    placeholder="Enter user email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    }}
                  >
                    <option
                      value="FAN"
                      style={{ backgroundColor: "#1a1a1a", color: "white" }}
                    >
                      Fan
                    </option>
                    <option
                      value="CELEBRITY"
                      style={{ backgroundColor: "#1a1a1a", color: "white" }}
                    >
                      Celebrity
                    </option>
                    <option
                      value="ADMIN"
                      style={{ backgroundColor: "#1a1a1a", color: "white" }}
                    >
                      Admin
                    </option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleAddUser}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    Add User
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddUserModal(false);
                      setNewUser({
                        name: "",
                        email: "",
                        password: "",
                        role: "FAN",
                      });
                    }}
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {showViewUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                User Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Name
                  </label>
                  <p className="text-white">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Email
                  </label>
                  <p className="text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Role
                  </label>
                  <p className="text-white">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Joined
                  </label>
                  <p className="text-white">
                    {new Date(selectedUser.joined).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => {
                      setShowViewUserModal(false);
                      setSelectedUser(null);
                    }}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editUser.name}
                    onChange={(e) =>
                      setEditUser({ ...editUser, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) =>
                      setEditUser({ ...editUser, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Role
                  </label>
                  <select
                    value={editUser.role}
                    onChange={(e) =>
                      setEditUser({ ...editUser, role: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    }}
                  >
                    <option
                      value="FAN"
                      style={{ backgroundColor: "#1a1a1a", color: "white" }}
                    >
                      Fan
                    </option>
                    <option
                      value="CELEBRITY"
                      style={{ backgroundColor: "#1a1a1a", color: "white" }}
                    >
                      Celebrity
                    </option>
                    <option
                      value="ADMIN"
                      style={{ backgroundColor: "#1a1a1a", color: "white" }}
                    >
                      Admin
                    </option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleUpdateUser}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    Update User
                  </Button>
                  <Button
                    onClick={() => {
                      setShowEditUserModal(false);
                      setSelectedUser(null);
                    }}
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Booking Modal */}
        {showViewBookingModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                Booking Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Customer
                  </label>
                  <p className="text-white">{selectedBooking.customer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Celebrity
                  </label>
                  <p className="text-white">{selectedBooking.celebrity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Amount
                  </label>
                  <p className="text-white">${selectedBooking.amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Status
                  </label>
                  <p className="text-white">{selectedBooking.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Date
                  </label>
                  <p className="text-white">{selectedBooking.date}</p>
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => {
                      setShowViewBookingModal(false);
                      setSelectedBooking(null);
                    }}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Booking Modal */}
        {showEditBookingModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                Edit Booking Status
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Customer
                  </label>
                  <p className="text-white">{selectedBooking.customer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Celebrity
                  </label>
                  <p className="text-white">{selectedBooking.celebrity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Amount
                  </label>
                  <p className="text-white">${selectedBooking.amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80">
                    Status
                  </label>
                  <select
                    value={editBooking.status}
                    onChange={(e) =>
                      setEditBooking({ ...editBooking, status: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    }}
                  >
                    <option
                      value="PENDING"
                      style={{ backgroundColor: "#1a1a1a", color: "white" }}
                    >
                      Pending
                    </option>
                    <option
                      value="CONFIRMED"
                      style={{ backgroundColor: "#1a1a1a", color: "white" }}
                    >
                      Confirmed
                    </option>
                    <option
                      value="COMPLETED"
                      style={{ backgroundColor: "#1a1a1a", color: "white" }}
                    >
                      Completed
                    </option>
                    <option
                      value="CANCELLED"
                      style={{ backgroundColor: "#1a1a1a", color: "white" }}
                    >
                      Cancelled
                    </option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleUpdateBookingStatus}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    Update Status
                  </Button>
                  <Button
                    onClick={() => {
                      setShowEditBookingModal(false);
                      setSelectedBooking(null);
                    }}
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthRedirect>
  );
}
