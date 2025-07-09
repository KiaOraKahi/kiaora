"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function OrderDebugPage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [paymentIntentId, setPaymentIntentId] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkOrder = async () => {
    if (!orderNumber && !paymentIntentId) {
      alert("Please enter either an order number or payment intent ID")
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (orderNumber) params.set("orderNumber", orderNumber)
      if (paymentIntentId) params.set("paymentIntentId", paymentIntentId)

      const response = await fetch(`/api/debug/order-status?${params}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      setResult({ error: "Failed to fetch order data" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Order Debug Tool</h1>

        <Card className="bg-white/10 border-white/20 mb-8">
          <CardHeader>
            <CardTitle>Search Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Order Number</label>
              <Input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="KO-1234567890-ABC123"
                className="bg-white/10 border-white/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Intent ID</label>
              <Input
                value={paymentIntentId}
                onChange={(e) => setPaymentIntentId(e.target.value)}
                placeholder="pi_3Riw7x4KPvm4TDMZ0Gct9FoR"
                className="bg-white/10 border-white/20"
              />
            </div>
            <Button onClick={checkOrder} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? "Checking..." : "Check Order"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle>Debug Results</CardTitle>
            </CardHeader>
            <CardContent>
              {result.error ? (
                <div className="space-y-4">
                  <div className="text-red-400">Error: {result.error}</div>
                  {result.recentOrders && (
                    <div>
                      <h3 className="font-semibold mb-2">Recent Orders:</h3>
                      <div className="space-y-2">
                        {result.recentOrders.map((order: any) => (
                          <div key={order.id} className="p-2 bg-white/5 rounded">
                            <div>Order: {order.orderNumber}</div>
                            <div>Payment Intent: {order.paymentIntentId || "NULL"}</div>
                            <div>
                              Status: {order.status} / {order.paymentStatus}
                            </div>
                            <div>Amount: ${order.totalAmount}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Order Info */}
                  <div>
                    <h3 className="font-semibold mb-2">Order Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Order Number: {result.order.orderNumber}</div>
                      <div>Payment Intent: {result.order.paymentIntentId || "NULL"}</div>
                      <div>
                        Payment Status:
                        <Badge
                          className={`ml-2 ${
                            result.order.paymentStatus === "SUCCEEDED"
                              ? "bg-green-600"
                              : result.order.paymentStatus === "PENDING"
                                ? "bg-yellow-600"
                                : "bg-red-600"
                          }`}
                        >
                          {result.order.paymentStatus}
                        </Badge>
                      </div>
                      <div>
                        Order Status:
                        <Badge
                          className={`ml-2 ${
                            result.order.status === "CONFIRMED"
                              ? "bg-green-600"
                              : result.order.status === "PENDING"
                                ? "bg-yellow-600"
                                : "bg-red-600"
                          }`}
                        >
                          {result.order.status}
                        </Badge>
                      </div>
                      <div>Total Amount: ${result.order.totalAmount}</div>
                      <div>Platform Fee: ${result.order.platformFee || "NULL"}</div>
                      <div>Celebrity Amount: ${result.order.celebrityAmount || "NULL"}</div>
                      <div>Transfer Status: {result.order.transferStatus}</div>
                      <div>Paid At: {result.order.paidAt || "NULL"}</div>
                      <div>Created: {new Date(result.order.createdAt).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div>
                    <h3 className="font-semibold mb-2">Booking Information</h3>
                    {result.booking ? (
                      <div className="text-sm">
                        <div>Booking ID: {result.booking.id}</div>
                        <div>Status: {result.booking.status}</div>
                        <div>Created: {new Date(result.booking.createdAt).toLocaleString()}</div>
                      </div>
                    ) : (
                      <div className="text-red-400">No booking found</div>
                    )}
                  </div>

                  {/* Celebrity Info */}
                  <div>
                    <h3 className="font-semibold mb-2">Celebrity Information</h3>
                    <div className="text-sm">
                      <div>Name: {result.celebrity.name}</div>
                      <div>Connect Account: {result.celebrity.stripeConnectAccountId || "NULL"}</div>
                      <div>Payouts Enabled: {result.celebrity.stripePayoutsEnabled ? "Yes" : "No"}</div>
                    </div>
                  </div>

                  {/* Raw Data */}
                  <details>
                    <summary className="cursor-pointer font-semibold">Raw Data</summary>
                    <pre className="mt-2 p-4 bg-black/50 rounded text-xs overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}