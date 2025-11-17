"use client";

import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Play,
  Star,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Heart,
  Gift,
  ThumbsUp,
  ThumbsDown,
  Eye,
  MessageCircle,
  DollarSign,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { VideoUploadModal } from "@/components/video-upload-modal";

interface CelebrityBookingDetails {
  id: string;
  orderNumber: string;
  status: string;
  amount: number;
  celebrityAmount: number;
  tipAmount: number;
  tipMessage?: string;
  totalEarnings: number;
  requestedDate: string;
  deadline: string | null;
  paymentStatus: string;
  videoUrl: string | null;
  approvalStatus: string;
  approvedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  revisionCount: number;
  customerName: string;
  customerEmail: string;
  customerImage: string | null;
  recipientName: string;
  occasion: string;
  instructions: string;
  personalMessage: string;
  specialInstructions: string;
  tips: Array<{
    id: string;
    amount: number;
    message: string | null;
    createdAt: string;
  }>;
}

export default function CelebrityBookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const bookingId = params?.id as string;
  const [booking, setBooking] = useState<CelebrityBookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the booking from the existing booking-requests data
      const response = await fetch(
        `/api/celebrity/booking-requests?status=ALL&limit=100`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch booking data");
      }

      const data = await response.json();
      const foundBooking = data.requests?.find(
        (req: any) => req.id === bookingId
      );

      if (foundBooking) {
        setBooking(foundBooking);
      } else {
        setError("Booking not found");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      setError("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUploadSuccess = () => {
    // Refresh the booking details to show the updated video
    fetchBookingDetails();
    toast.success("Video uploaded successfully! Customer has been notified.");
  };

  const getStatusBadgeColor = (status: string) => {
    if (!status) return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "confirmed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getApprovalStatusBadgeColor = (approvalStatus: string) => {
    if (!approvalStatus)
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    switch (approvalStatus.toLowerCase()) {
      case "pending_approval":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "approved":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "declined":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "revision_requested":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getRevenueBreakdown = () => {
    if (!booking) {
      return {
        bookingAmount: 0,
        tipAmount: 0,
        platformFees: 0,
        celebrityShare: 0,
        totalEarnings: 0,
        sharePercentLabel: "73.9%",
      };
    }

    const GST_RATE = 0.15;
    const OTHER_FEES_RATE = 0.089;
    const TOTAL_FEES_RATE = GST_RATE + OTHER_FEES_RATE;

    const bookingAmount = Math.round(booking.amount || 0);
    const tipAmount = Math.round(booking.tipAmount || 0);
    const baseAmount = Math.max(bookingAmount - tipAmount, 0);

    const detectedShare = baseAmount > 0 ? (booking.celebrityAmount || 0) / baseAmount : 0;
    const sharePercent = Math.abs(detectedShare - 0.8) < 0.03 ? 0.8 : 0.739;
    const sharePercentLabel = sharePercent === 0.8 ? "80%" : "73.9%";

    const platformFees = Math.round(baseAmount * TOTAL_FEES_RATE);
    const amountAfterFees = Math.max(baseAmount - platformFees, 0);
    const celebrityShare = Math.round(amountAfterFees * sharePercent);
    const totalEarnings = celebrityShare + tipAmount;

    return {
      bookingAmount,
      tipAmount,
      platformFees,
      celebrityShare,
      totalEarnings,
      sharePercentLabel,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Error Loading Booking
          </h1>
          <p className="text-red-200 mb-6">{error}</p>
          <Button
            onClick={() => router.back()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Booking Not Found
          </h1>
          <p className="text-red-200 mb-6">
            The booking you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Button
            onClick={() => router.back()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Booking Details
              </h1>
              <p className="text-purple-200">Order #{booking.orderNumber}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusBadgeColor(booking.status)}>
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </Badge>
              {booking.approvalStatus && (
                <Badge
                  className={getApprovalStatusBadgeColor(
                    booking.approvalStatus
                  )}
                >
                  {booking.approvalStatus.replace("_", " ")}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Booking Info */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer & Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={booking.customerImage || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {booking.customerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {booking.customerName}
                    </h3>
                    <p className="text-purple-200">{booking.customerEmail}</p>
                    <p className="text-purple-300 text-sm">
                      Booking requested{" "}
                      {format(new Date(booking.requestedDate), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <Separator className="bg-white/20" />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-200 text-sm">
                      Recipient Name
                    </Label>
                    <p className="text-white font-medium">
                      {booking.recipientName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-purple-200 text-sm">Occasion</Label>
                    <p className="text-white font-medium">{booking.occasion}</p>
                  </div>
                  <div>
                    <Label className="text-purple-200 text-sm">Deadline</Label>
                    <p className="text-white font-medium">
                      {booking.deadline
                        ? format(new Date(booking.deadline), "MMM d, yyyy")
                        : "No deadline set"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-purple-200 text-sm">
                      Payment Status
                    </Label>
                    <p className="text-white font-medium capitalize">
                      {booking.paymentStatus}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-purple-200 text-sm">
                      Personal Message
                    </Label>
                    <p className="text-white bg-white/5 p-3 rounded-lg mt-2">
                      {booking.personalMessage ||
                        "No personal message provided"}
                    </p>
                  </div>

                  <div>
                    <Label className="text-purple-200 text-sm">
                      Special Instructions
                    </Label>
                    <p className="text-white bg-white/5 p-3 rounded-lg mt-2">
                      {booking.specialInstructions ||
                        "No special instructions provided"}
                    </p>
                  </div>

                  <div>
                    <Label className="text-purple-200 text-sm">
                      Tip Message
                    </Label>
                    <p className="text-white bg-white/5 p-3 rounded-lg mt-2">
                      {booking.tips?.slice().reverse().find((t) => t.message)?.message ??
                        booking.tipMessage ??
                        "No tip message provided"}
                    </p>
                  </div>

                  {/* {booking.instructions && (
                    <div>
                      <Label className="text-purple-200 text-sm">Additional Instructions</Label>
                      <p className="text-white bg-white/5 p-3 rounded-lg mt-2">{booking.instructions}</p>
                    </div>
                  )} */}
                </div>
              </CardContent>
            </Card>

            {/* Video Section */}
            {booking.videoUrl && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Video Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black rounded-lg p-4">
                    <video
                      controls
                      className="w-full rounded-lg"
                      src={booking.videoUrl || undefined}
                      poster="/video-placeholder.jpg"
                      onError={() => {
                        try {
                          // eslint-disable-next-line no-console
                          console.warn("Video failed to load from src:", booking.videoUrl);
                        } catch {}
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => window.open(booking.videoUrl!, "_blank")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Screen
                    </Button>
                    <Button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = booking.videoUrl!;
                        link.download = `${booking.orderNumber}-video.mp4`;
                        link.click();
                      }}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips Section */}
            {booking.tips.length > 0 && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Tips Received
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {booking.tips.map((tip) => (
                      <div
                        key={tip.id}
                        className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-300 font-semibold">
                              +${tip.amount.toLocaleString()} tip
                            </p>
                            {tip.message && (
                              <p className="text-white text-sm mt-1">
                                {tip.message}
                              </p>
                            )}
                          </div>
                          <span className="text-purple-400 text-xs">
                            {format(new Date(tip.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const breakdown = getRevenueBreakdown();
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Booking Amount</span>
                        <span className="text-white font-semibold">
                          ${breakdown.bookingAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Platform Fees (23.9%)</span>
                        <span className="text-red-300">- ${breakdown.platformFees.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Celebrity Share ({breakdown.sharePercentLabel})</span>
                        <span className="text-green-300">${breakdown.celebrityShare.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Tips</span>
                        <span className="text-yellow-300">+${breakdown.tipAmount.toLocaleString()}</span>
                      </div>
                      <Separator className="bg-white/20" />
                      <div className="flex justify-between">
                        <span className="text-green-200 font-semibold">Total Earnings</span>
                        <span className="text-green-400 font-bold text-lg">
                          ${breakdown.totalEarnings.toLocaleString()}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Booking Timeline */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Booking Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm">Booking Requested</p>
                    <p className="text-purple-300 text-xs">
                      {format(new Date(booking.requestedDate), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {booking.deadline && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">Deadline Set</p>
                      <p className="text-purple-300 text-xs">
                        {format(new Date(booking.deadline), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}

                {booking.videoUrl && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">Video Delivered</p>
                      <p className="text-purple-300 text-xs">Video uploaded</p>
                    </div>
                  </div>
                )}

                {booking.approvedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">Video Approved</p>
                      <p className="text-purple-300 text-xs">
                        {format(new Date(booking.approvedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}

                {booking.declinedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">Video Declined</p>
                      <p className="text-purple-300 text-xs">
                        {format(new Date(booking.declinedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push("/celebrity-dashboard")}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>

                {booking.status === "confirmed" && !booking.videoUrl && (
                  <VideoUploadModal
                    bookingId={booking.id}
                    orderNumber={booking.orderNumber}
                    customerName={booking.customerName}
                    onUploadSuccess={handleVideoUploadSuccess}
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Play className="w-4 h-4 mr-2" />
                      Upload Video
                    </Button>
                  </VideoUploadModal>
                )}

                {booking.approvalStatus === "DECLINED" &&
                  (booking.revisionCount || 0) < 2 && (
                    <VideoUploadModal
                      bookingId={booking.id}
                      orderNumber={booking.orderNumber}
                      customerName={booking.customerName}
                      onUploadSuccess={handleVideoUploadSuccess}
                    >
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                        <Play className="w-4 h-4 mr-2" />
                        Upload Revision
                      </Button>
                    </VideoUploadModal>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
