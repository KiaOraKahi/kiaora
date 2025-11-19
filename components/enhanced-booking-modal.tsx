"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Upload,
  FileText,
  Star,
  Zap,
  Music,
  Video,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StripeProvider from "./stripe-provider";
import PaymentForm from "./payment-form";

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  rushPrice?: number;
  duration: string;
  deliveryTime: string;
  icon: string;
  features: string[];
}

interface BookingModalProps {
  celebrity: any;
  selectedService?: Service;
  isOpen: boolean;
  onClose: () => void;
}

const addOns = [
  {
    id: "rush",
    icon: <Zap className="w-5 h-5" />,
    title: "ASAP Delivery",
    description: "Get your video in 12 hours",
    price: 99,
  },
];

// Tip amounts for celebrity appreciation
const TIP_AMOUNTS = [5, 10, 20, 50, 100];

// Icon mapping for services
const getServiceIcon = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    video: <Video className="w-5 h-5" />,
    message: <MessageSquare className="w-5 h-5" />,
    star: <Star className="w-5 h-5" />,
    music: <Music className="w-5 h-5" />,
  };
  return icons[iconName] || <Star className="w-5 h-5" />;
};

// Mock availability data
const getAvailabilityData = (date: Date) => {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (isWeekend) {
    return {
      available: Math.random() > 0.3,
      slots: Math.random() > 0.5 ? ["10:00 AM", "2:00 PM"] : ["6:00 PM"],
      price: Math.floor(Math.random() * 100) + 50,
    };
  } else {
    return {
      available: Math.random() > 0.2,
      slots: ["9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM"].filter(
        () => Math.random() > 0.4
      ),
      price: 0,
    };
  }
};

const calculateRevenueSplit = (
  totalAmount: number,
  tipAmount: number,
  isVip: boolean
) => {
  // Constants for fee calculation
  const GST_RATE = 0.15; // 15%
  const OTHER_FEES_RATE = 0.089; // 8.9%
  const TOTAL_FEES_RATE = GST_RATE + OTHER_FEES_RATE; // 23.9%

  // Base amount (excluding tips)
  const baseAmount = totalAmount - tipAmount;

  // Calculate fees on base amount
  const gstAmount = baseAmount * GST_RATE;
  const otherFeesAmount = baseAmount * OTHER_FEES_RATE;
  const totalFeesAmount = gstAmount + otherFeesAmount;

  // Amount after fees (for revenue split)
  const amountAfterFees = baseAmount - totalFeesAmount;

  // Revenue split based on VIP status
  let celebrityShare, platformShare;

  if (isVip) {
    celebrityShare = amountAfterFees * 0.8;
    platformShare = amountAfterFees * 0.2;
  } else {
    celebrityShare = amountAfterFees * 0.7;
    platformShare = amountAfterFees * 0.3;
  }

  // Add 100% of tips to celebrity share
  celebrityShare += tipAmount;

  // Total platform share includes fees + platform revenue share
  const totalPlatformShare = totalFeesAmount + platformShare;

  return {
    totalAmount,
    baseAmount,
    tipAmount,
    gstAmount: Math.round(gstAmount),
    otherFeesAmount: Math.round(otherFeesAmount),
    totalFeesAmount: Math.round(totalFeesAmount),
    amountAfterFees: Math.round(amountAfterFees),
    celebrityShare: Math.round(celebrityShare),
    platformShare: Math.round(platformShare),
    totalPlatformShare: Math.round(totalPlatformShare),
    isVip,
    splitPercentage: isVip ? "80/20" : "70/30",
  };
};

export default function EnhancedBookingModal({
  celebrity,
  selectedService,
  isOpen,
  onClose,
}: BookingModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<string>();
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [availability, setAvailability] = useState<any>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>();
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>();
  const [paymentError, setPaymentError] = useState<string>("");
  const [revenueSplit, setRevenueSplit] = useState<any>(null);

  const [formData, setFormData] = useState({
    recipientName: "",
    occasion: "",
    personalMessage: "",
    specialInstructions: "",
    email: session?.user?.email || "",
    phone: "",
    tipAmount: 0,
    tipMessage: "",
  });

  // Debug logging for state changes
  useEffect(() => {
    console.log("🔍 Modal state changed:", {
      currentStep,
      clientSecret: clientSecret ? "EXISTS" : "MISSING",
      orderNumber,
      isCreatingPayment,
      paymentError,
    });
  }, [currentStep, clientSecret, orderNumber, isCreatingPayment, paymentError]);

  // Update email when session changes
  useEffect(() => {
    if (session?.user?.email) {
      setFormData((prev) => ({ ...prev, email: session.user.email || "" }));
    }
  }, [session]);

  // Check availability when date changes
  useEffect(() => {
    if (selectedDate) {
      setIsCheckingAvailability(true);
      setSelectedSlot(undefined);

      setTimeout(() => {
        const availabilityData = getAvailabilityData(selectedDate);
        setAvailability(availabilityData);
        setIsCheckingAvailability(false);
      }, 1000);
    }
  }, [selectedDate]);

  // Calculate total price
  // Calculate delivery time based on selected add-ons
  const getDeliveryTime = () => {
    if (selectedAddOns.includes("rush")) {
      return "12 hours";
    }
    return selectedService.deliveryTime;
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;

    const basePrice =
      selectedService.startingPrice || selectedService.basePrice || 0;
    const addOnTotal = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find((a) => a.id === addOnId);
      return total + (addOn ? addOn.price : 0);
    }, 0);
    const availabilityPremium = availability?.price || 0;
    const tipAmount = formData.tipAmount || 0;

    return basePrice + addOnTotal + availabilityPremium + tipAmount;
  };

  useEffect(() => {
    if (selectedService) {
      const total = calculateTotal();
      const tip = formData.tipAmount || 0;
      const isVip = celebrity?.isVIP || false; // Assuming celebrity object has isVip property
      const split = calculateRevenueSplit(total, tip, isVip);
      setRevenueSplit(split);
    }
  }, [
    selectedService,
    formData.tipAmount,
    selectedAddOns,
    availability,
    celebrity,
  ]);

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId)
        ? prev.filter((id) => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const createPaymentIntent = async () => {
    if (!session) {
      setPaymentError("Please sign in to continue with booking");
      return;
    }

    if (!selectedService) {
      setPaymentError("Please select a service to continue");
      return;
    }

    // Require phone number before proceeding to payment
    if (!formData.phone || formData.phone.trim().length < 6) {
      setPaymentError("Please enter your phone number");
      return;
    }

    setIsCreatingPayment(true);
    setPaymentError("");

    try {
      console.log("🔄 Creating payment intent for celebrity:", celebrity);
      console.log("🔍 Selected service:", selectedService);
      console.log(
        "💰 Base price:",
        selectedService?.startingPrice || selectedService?.basePrice
      );
      console.log("🎯 Selected add-ons:", selectedAddOns);
      console.log("📅 Availability premium:", availability?.price);

      const totalAmount = calculateTotal();
      console.log("💵 Total amount calculated:", totalAmount);

      if (totalAmount <= 0) {
        throw new Error(
          "Invalid total amount. Please select a service and try again."
        );
      }

      // Prepare order items
      const orderItems = [
        {
          type: "service",
          name: `${celebrity.name} - ${
            selectedService.title || selectedService.name
          }`,
          description: `${selectedService.description} for ${formData.recipientName}`,
          quantity: 1,
          unitPrice:
            selectedService.startingPrice || selectedService.basePrice || 0,
          totalPrice:
            selectedService.startingPrice || selectedService.basePrice || 0,
          metadata: {
            serviceId: selectedService.id,
            duration: selectedService.duration,
            deliveryTime: selectedService.deliveryTime,
          },
        },
      ];

      // Add selected add-ons
      selectedAddOns.forEach((addOnId) => {
        const addOn = addOns.find((a) => a.id === addOnId);
        if (addOn) {
          orderItems.push({
            type: "addon",
            name: addOn.title,
            description: addOn.description,
            quantity: 1,
            unitPrice: addOn.price,
            totalPrice: addOn.price,
            metadata: {
              addOnId,
              serviceId: selectedService.id,
              duration: selectedService.duration,
              deliveryTime: selectedService.deliveryTime,
            } as any,
          });
        }
      });

      // Add weekend premium if applicable
      if (availability?.price > 0) {
        orderItems.push({
          type: "premium",
          name: "Weekend Premium",
          description: "Additional charge for weekend scheduling",
          quantity: 1,
          unitPrice: availability.price,
          totalPrice: availability.price,
          metadata: {
            premiumType: "weekend",
            serviceId: selectedService.id,
            duration: selectedService.duration,
            deliveryTime: selectedService.deliveryTime,
          } as any,
        });
      }

      // Add tip if selected
      if (formData.tipAmount > 0) {
        orderItems.push({
          type: "tip",
          name: "Tip for Celebrity",
          description: formData.tipMessage || "Appreciation tip",
          quantity: 1,
          unitPrice: formData.tipAmount,
          totalPrice: formData.tipAmount,
          metadata: {
            tipType: "appreciation",
            tipMessage: formData.tipMessage,
            serviceId: selectedService.id,
          } as any,
        });
      }

      const bookingData = {
        ...formData,
        scheduledDate: selectedDate?.toISOString(),
        scheduledTime: selectedSlot,
        serviceId: selectedService.id,
        tipAmount: formData.tipAmount,
        tipMessage: formData.tipMessage,
        revenueSplit: revenueSplit,
      };

      console.log("📝 Sending payment request:", {
        celebrityId: celebrity.id,
        amount: totalAmount,
        bookingData,
        orderItems,
        revenueSplit,
      });

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          celebrityId: celebrity.id,
          amount: totalAmount,
          bookingData,
          orderItems,
          revenueSplit,
          isVIP: celebrity?.isVIP || false,
        }),
      });

      const data = await response.json();
      console.log("📨 Payment response:", data);

      if (response.ok) {
        console.log("✅ Payment intent created successfully");
        console.log(
          "🔑 Setting client secret:",
          data.clientSecret ? "EXISTS" : "MISSING"
        );
        console.log("📋 Setting order number:", data.orderNumber);

        setClientSecret(data.clientSecret);
        setOrderNumber(data.orderNumber);

        console.log("🔄 About to set current step to 6");
        setCurrentStep(5); // Move to payment step

        console.log("✅ Step transition initiated");
        console.log("🔍 Current step after setState:", currentStep); // This will still show old value due to closure
      } else {
        throw new Error(
          data.error || data.details || "Failed to create payment"
        );
      }
    } catch (error) {
      console.error("❌ Payment creation error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create payment. Please try again.";
      setPaymentError(errorMessage);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log("✅ Payment successful:", paymentIntent);
    setOrderConfirmed(true);
    setCurrentStep(6); // Move to confirmation step (step 7)
  };

  const handlePaymentError = (error: string) => {
    console.error("❌ Payment error:", error);
    setPaymentError(`Payment failed: ${error}`);
    // Don't go back to step 4, stay on payment step so user can retry
  };

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedDate(undefined);
    setSelectedSlot(undefined);
    setSelectedAddOns([]);
    setAvailability(null);
    setUploadedFiles([]);
    setOrderConfirmed(false);
    setOrderNumber(undefined);
    setClientSecret(undefined);
    setPaymentError("");
    setFormData({
      recipientName: "",
      occasion: "",
      personalMessage: "",
      specialInstructions: "",
      email: session?.user?.email || "",
      phone: "",
      tipAmount: 0,
      tipMessage: "",
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  // Check if user is logged in
  if (!session) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/20 rounded-2xl max-w-md w-full p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Sign In Required
              </h3>
              <p className="text-purple-200 mb-6">
                Please sign in to your account to book a personalized message
                from {celebrity.name}.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push("/auth/signin")}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Check if service is selected
  if (!selectedService) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/20 rounded-2xl max-w-md w-full p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Service Required
              </h3>
              <p className="text-purple-200 mb-6">
                Please select a service first to continue with your booking.
              </p>
              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Go Back
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {getServiceIcon(selectedService.icon)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Book {celebrity.name}
                </h3>
                <p className="text-purple-200">
                  {orderConfirmed
                    ? "Booking Confirmed!"
                    : `${selectedService.title} - Step ${currentStep} of ${
                        currentStep === 6 ? 6 : 6
                      }`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Error Display */}
          {paymentError && (
            <div className="mx-6 mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">Payment Error</span>
              </div>
              <p className="text-red-200 text-sm mt-1">{paymentError}</p>
              {currentStep === 5 && (
                <Button
                  onClick={() => setPaymentError("")}
                  className="mt-3 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-200"
                  size="sm"
                >
                  Try Again
                </Button>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {!orderConfirmed && currentStep <= 6 && (
            <div className="px-6 py-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep >= step
                          ? "bg-purple-500 text-white"
                          : "bg-white/20 text-purple-300"
                      }`}
                    >
                      {currentStep > step ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 5 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          currentStep > step ? "bg-purple-500" : "bg-white/20"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex space-around mt-2 text-sm">
                <span
                  className={
                    currentStep >= 1 ? "text-white" : "text-purple-300"
                  }
                >
                  Details
                </span>
                <span
                  className={
                    currentStep >= 2 ? "text-white" : "text-purple-300"
                  }
                >
                  Add-ons
                </span>
                <span
                  className={
                    currentStep >= 3 ? "text-white" : "text-purple-300"
                  }
                >
                  Tips
                </span>
                <span
                  className={
                    currentStep >= 4 ? "text-white" : "text-purple-300"
                  }
                >
                  Review
                </span>
                <span
                  className={
                    currentStep >= 5 ? "text-white" : "text-purple-300"
                  }
                >
                  Payment
                </span>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Step 1: Basic Details */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    Service Details
                  </h4>
                  <div className="bg-white/10 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-purple-400">
                        {getServiceIcon(selectedService.icon)}
                      </div>
                      <div>
                        <h5 className="text-white font-semibold">
                          {selectedService.title}
                        </h5>
                        <p className="text-purple-200 text-sm">
                          {selectedService.description}
                        </p>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-2xl font-bold text-purple-300">
                          ${selectedService.startingPrice}
                        </div>
                        <div className="text-purple-400 text-sm">
                          {selectedService.duration}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.features.map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white mb-2 block">
                      Recipient Name *
                    </Label>
                    <Input
                      value={formData.recipientName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recipientName: e.target.value,
                        })
                      }
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                      placeholder="Who is this message for?"
                    />
                  </div>
                  <div>
                    <Label className="text-white mb-2 block">Occasion *</Label>
                    <Select
                      value={formData.occasion}
                      onValueChange={(value) =>
                        setFormData({ ...formData, occasion: value })
                      }
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white!">
                        <SelectValue placeholder="Select occasion" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20 text-white">
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="congratulations">
                          Congratulations
                        </SelectItem>
                        <SelectItem value="motivation">Motivation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">
                    Personal Message *
                  </Label>
                  <Textarea
                    value={formData.personalMessage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalMessage: e.target.value,
                      })
                    }
                    rows={4}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 resize-none"
                    placeholder="What would you like the celebrity to say? Include specific details, names, and any personal touches..."
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">
                    Special Instructions
                  </Label>
                  <Textarea
                    value={formData.specialInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialInstructions: e.target.value,
                      })
                    }
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 resize-none"
                    placeholder="Any specific requests, pronunciation guides, or additional information..."
                  />
                </div>

                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={
                    !formData.recipientName ||
                    !formData.occasion ||
                    !formData.personalMessage
                  }
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Continue to Scheduling
                </Button>
              </motion.div>
            )}

            {/* Step 3: Add-ons & Media Upload */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h4 className="text-xl font-bold text-white">
                  Enhance Your Experience
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  {addOns.map((addOn) => (
                    <div
                      key={addOn.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedAddOns.includes(addOn.id)
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-white/20 bg-white/10 hover:bg-white/20"
                      }`}
                      onClick={() => handleAddOnToggle(addOn.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-purple-400">{addOn.icon}</div>
                          <div>
                            <h5 className="text-white font-semibold">
                              {addOn.title}
                            </h5>
                            <p className="text-purple-200 text-sm">
                              {addOn.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-purple-300 font-semibold">
                            +${addOn.price}
                          </div>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedAddOns.includes(addOn.id)
                                ? "border-purple-500 bg-purple-500"
                                : "border-white/40"
                            }`}
                          >
                            {selectedAddOns.includes(addOn.id) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Media Upload */}
                <div className="hidden">
                  <Label className="text-white mb-4 block">
                    Upload Reference Materials (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                    <p className="text-white mb-2">
                      Upload photos, videos, or documents
                    </p>
                    <p className="text-purple-300 text-sm mb-4">
                      Help the celebrity personalize your message with reference
                      materials
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      asChild
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Choose Files
                      </label>
                    </Button>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-purple-400" />
                            <span className="text-white text-sm">
                              {file.name}
                            </span>
                            <span className="text-purple-300 text-xs">
                              ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Continue to Tips
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Tip Selection */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h4 className="text-xl font-bold text-white">
                  Show Your Appreciation
                </h4>
                <p className="text-purple-200 text-center">
                  Tips are a great way to show appreciation for the celebrity's
                  work. 100% goes directly to them!
                </p>

                {/* Tip Amount Selection */}
                <div>
                  <Label className="text-white mb-4 block">
                    Select Tip Amount
                  </Label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {TIP_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        onClick={() =>
                          setFormData({ ...formData, tipAmount: amount })
                        }
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          formData.tipAmount === amount
                            ? "border-purple-500 bg-purple-500/20 text-white"
                            : "border-white/20 bg-white/10 text-purple-200 hover:bg-white/20"
                        }`}
                      >
                        <div className="text-2xl font-bold">${amount}</div>
                        <div className="text-sm opacity-80">Tip</div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Tip Amount */}
                  <div className="relative">
                    <Label className="text-white mb-2 block">
                      Custom Amount (Optional)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300">
                        $
                      </span>
                      <Input
                        type="number"
                        min="0"
                        max="1000"
                        step="1"
                        value={
                          formData.tipAmount === 0 ? "" : formData.tipAmount
                        }
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setFormData({ ...formData, tipAmount: value });
                        }}
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 pl-8"
                        placeholder="Enter custom amount"
                      />
                    </div>
                    <p className="text-purple-300 text-xs mt-1">
                      Maximum tip: $1,000
                    </p>
                  </div>
                </div>

                {/* Tip Message */}
                <div>
                  <Label className="text-white mb-2 block">
                    Tip Message (Optional)
                  </Label>
                  <Textarea
                    value={formData.tipMessage}
                    onChange={(e) =>
                      setFormData({ ...formData, tipMessage: e.target.value })
                    }
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 resize-none"
                    placeholder="Add a personal message to go with your tip..."
                    maxLength={200}
                  />
                  <p className="text-purple-300 text-xs mt-1 text-right">
                    {formData.tipMessage.length}/200
                  </p>
                </div>

                {/* Tip Summary */}
                {formData.tipAmount > 0 && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">
                          Tip Summary
                        </div>
                        <div className="text-purple-200 text-sm">
                          {formData.tipMessage
                            ? `"${formData.tipMessage}"`
                            : "No message"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-300">
                          ${formData.tipAmount}
                        </div>
                        <div className="text-purple-400 text-sm">
                          100% to celebrity
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Continue to Review
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Review & Contact Info */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h4 className="text-xl font-bold text-white">
                  Review Your Booking
                </h4>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h5 className="text-white font-semibold mb-4">
                      Contact Information
                    </h5>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white mb-2 block">
                          Email Address *
                        </Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <Label className="text-white mb-2 block">
                          Phone Number *
                        </Label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>
                    </div>
                    {revenueSplit && (
                      <div className="mt-6 bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-blue-500/30 rounded-lg p-4">
                        {/* <h5 className="text-white font-semibold mb-3">Revenue Allocation</h5>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between text-blue-200">
                            <span>Total Amount:</span>
                            <span>${revenueSplit.totalAmount}</span>
                          </div>
                          <div className="flex justify-between text-blue-200">
                            <span>Base Amount:</span>
                            <span>${revenueSplit.baseAmount}</span>
                          </div>
                          <div className="flex justify-between text-blue-200">
                            <span>Tip Amount:</span>
                            <span>${revenueSplit.tipAmount}</span>
                          </div>
                          <div className="flex justify-between text-green-200">
                            <span>GST (15%):</span>
                            <span>-${revenueSplit.gstAmount}</span>
                          </div>
                          <div className="flex justify-between text-green-200">
                            <span>Other Fees (8.9%):</span>
                            <span>-${revenueSplit.otherFeesAmount}</span>
                          </div>
                          <div className="border-t border-blue-500/30 pt-2 mt-2">
                            <div className="flex justify-between text-white font-semibold">
                              <span>Celebrity Share ({revenueSplit.splitPercentage}):</span>
                              <span>${revenueSplit.celebrityShare}</span>
                            </div>
                            <div className="flex justify-between text-purple-300 text-xs">
                              <span>Platform Share:</span>
                              <span>${revenueSplit.totalPlatformShare}</span>
                            </div>
                          </div>
                          <div className="text-blue-300 text-xs mt-2">
                            <p>• {celebrity.isVip ? "VIP Celebrity - 80/20 Split" : "Non-VIP Celebrity - 73.9/26.1 Split"}</p>
                            <p>• 100% of tips go directly to celebrity</p>
                          </div>
                        </div> */}
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className="text-white font-semibold mb-4">
                      Order Summary
                    </h5>
                    <div className="bg-white/10 rounded-lg p-6 space-y-3">
                      <div className="flex justify-between text-purple-200">
                        <span>
                          {celebrity.name} - {selectedService.name}
                        </span>
                        <span>${selectedService.startingPrice}</span>
                      </div>

                      {selectedAddOns.map((addOnId) => {
                        const addOn = addOns.find((a) => a.id === addOnId);
                        return addOn ? (
                          <div
                            key={addOnId}
                            className="flex justify-between text-purple-200"
                          >
                            <span>{addOn.title}</span>
                            <span>+${addOn.price}</span>
                          </div>
                        ) : null;
                      })}

                      {availability?.price > 0 && (
                        <div className="flex justify-between text-purple-200">
                          <span>Weekend Premium</span>
                          <span>+${availability.price}</span>
                        </div>
                      )}

                      {formData.tipAmount > 0 && (
                        <div className="flex justify-between text-purple-200">
                          <span>Tip for Celebrity</span>
                          <span>+${formData.tipAmount}</span>
                        </div>
                      )}

                      <div className="border-t border-white/20 pt-3 mt-4">
                        <div className="flex justify-between text-white font-bold text-xl">
                          <span>Total</span>
                          <span>${calculateTotal()}</span>
                        </div>
                      </div>

                      <div className="text-purple-300 text-sm mt-4">
                        <p>
                          • Scheduled for{" "}
                          {selectedDate && format(selectedDate, "MMMM d, yyyy")}{" "}
                          at {selectedSlot}
                        </p>
                        <p>• Delivery: {getDeliveryTime()}</p>
                        <p>• Duration: {selectedService.duration}</p>
                        {formData.tipAmount > 0 && (
                          <p>
                            • Tip: ${formData.tipAmount}{" "}
                            {formData.tipMessage &&
                              `- "${formData.tipMessage}"`}
                          </p>
                        )}
                        <p>• 100% satisfaction guarantee</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={createPaymentIntent}
                    disabled={
                      isCreatingPayment || !formData.email || !formData.phone
                    }
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isCreatingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Creating Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Payment - ${calculateTotal()}
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 6: Payment */}
            {currentStep === 5 && clientSecret && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {console.log("🎯 Payment step rendering - conditions met:", {
                  currentStep,
                  clientSecret: !!clientSecret,
                })}
                <h4 className="text-xl font-bold text-white">
                  Complete Your Payment
                </h4>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                  <h5 className="text-white font-semibold mb-4">
                    Order Summary
                  </h5>
                  <div className="flex justify-between text-purple-200 mb-2">
                    <span>
                      {celebrity.name} - {selectedService.name}
                    </span>
                    <span>${selectedService.startingPrice}</span>
                  </div>
                  {selectedAddOns.map((addOnId) => {
                    const addOn = addOns.find((a) => a.id === addOnId);
                    return addOn ? (
                      <div
                        key={addOnId}
                        className="flex justify-between text-purple-200 mb-2"
                      >
                        <span>{addOn.title}</span>
                        <span>+${addOn.price}</span>
                      </div>
                    ) : null;
                  })}
                  {availability?.price > 0 && (
                    <div className="flex justify-between text-purple-200 mb-2">
                      <span>Weekend Premium</span>
                      <span>+${availability.price}</span>
                    </div>
                  )}
                  {formData.tipAmount > 0 && (
                    <div className="flex justify-between text-purple-200 mb-2">
                      <span>Tip for Celebrity</span>
                      <span>+${formData.tipAmount}</span>
                    </div>
                  )}
                  <div className="border-t border-white/20 pt-3 mt-4">
                    <div className="flex justify-between text-white font-bold text-xl">
                      <span>Total</span>
                      <span>${calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                <StripeProvider clientSecret={clientSecret} theme="night">
                  <PaymentForm
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    amount={calculateTotal()}
                    orderNumber={orderNumber!}
                  />
                </StripeProvider>

                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(4)}
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Back to Review
                </Button>
              </motion.div>
            )}

            {/* Debug: Show payment step state when it should render but doesn't */}
            {currentStep === 5 && !clientSecret && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-yellow-300 mb-4">
                    Payment Step Debug
                  </h4>
                  <div className="text-yellow-200 text-sm space-y-2">
                    <p>
                      <strong>Current Step:</strong> {currentStep}
                    </p>
                    <p>
                      <strong>Client Secret:</strong>{" "}
                      {clientSecret ? "EXISTS" : "MISSING"}
                    </p>
                    <p>
                      <strong>Order Number:</strong> {orderNumber || "NOT SET"}
                    </p>
                    <p>
                      <strong>Payment Error:</strong> {paymentError || "NONE"}
                    </p>
                    <p>
                      <strong>Is Creating Payment:</strong>{" "}
                      {isCreatingPayment ? "YES" : "NO"}
                    </p>
                  </div>
                  <p className="text-yellow-300 mt-4">
                    The payment step should be showing but the client secret is
                    missing. This usually means there was an issue with the
                    payment intent creation.
                  </p>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    className="mt-4 bg-yellow-600 hover:bg-yellow-700"
                  >
                    Go Back to Review
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 7: Order Confirmation */}
            {currentStep === 6 && orderConfirmed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                <h4 className="text-3xl font-bold text-white mb-4">
                  Payment Successful! 🎉
                </h4>
                <p className="text-purple-200 mb-6 max-w-md mx-auto">
                  Your booking has been confirmed and payment processed. You'll
                  receive updates on your order status via email.
                </p>

                <div className="bg-white/10 rounded-lg p-6 max-w-md mx-auto mb-8">
                  <h5 className="text-white font-semibold mb-4">
                    Order Details
                  </h5>
                  <div className="text-purple-200 text-sm space-y-2 text-left">
                    <p>
                      <strong>Order Number:</strong> {orderNumber}
                    </p>
                    <p>
                      <strong>Celebrity:</strong> {celebrity.name}
                    </p>
                    <p>
                      <strong>Service:</strong>{" "}
                      {selectedService?.title ||
                        selectedService?.name ||
                        "Service"}
                    </p>
                    <p>
                      <strong>Recipient:</strong> {formData.recipientName}
                    </p>
                    <p>
                      <strong>Occasion:</strong> {formData.occasion}
                    </p>
                    <p>
                      <strong>Scheduled:</strong>{" "}
                      {selectedDate && format(selectedDate, "MMMM d, yyyy")} at{" "}
                      {selectedSlot}
                    </p>
                    <p>
                      <strong>Total Paid:</strong> ${calculateTotal()}
                    </p>
                    <p>
                      <strong>Expected Delivery:</strong> {getDeliveryTime()}
                    </p>
                    {formData.tipAmount > 0 && (
                      <p>
                        <strong>Tip Amount:</strong> ${formData.tipAmount}
                        {formData.tipMessage && ` - "${formData.tipMessage}"`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 justify-center mt-8">
                  <Button
                    onClick={() =>
                      window.open(`/orders/${orderNumber}`, "_blank")
                    }
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Track Order
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
