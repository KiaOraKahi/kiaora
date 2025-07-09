"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function WebhookDebugPage() {
  const [paymentIntentId, setPaymentIntentId] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const testWebhookEndpoint = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/webhooks/stripe/test")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      console.error("Error:", error)
      setTestResult({ error: "Failed to test webhook endpoint" })
    } finally {
      setLoading(false)
    }
  }

  const triggerWebhook = async () => {
    if (!paymentIntentId) {
      alert("Please enter a payment intent ID")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/debug/trigger-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentIntentId }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      setResult({ error: "Failed to trigger webhook" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Webhook Debug Tool</h1>

        {/* Test Webhook Endpoint */}
        <Card className="bg-white/10 border-white/20 mb-8">
          <CardHeader>
            <CardTitle>Test Webhook Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testWebhookEndpoint} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Testing..." : "Test Webhook Accessibility"}
            </Button>

            {testResult && (
              <div className="mt-4 p-4 bg-white/5 rounded">
                <pre className="text-xs overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Webhook Trigger */}
        <Card className="bg-white/10 border-white/20 mb-8">
          <CardHeader>
            <CardTitle>Manual Webhook Trigger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Payment Intent ID</label>
              <Input
                value={paymentIntentId}
                onChange={(e) => setPaymentIntentId(e.target.value)}
                placeholder="pi_3RixR24KPvm4TDMZ0qC0gQSI"
                className="bg-white/10 border-white/20"
              />
            </div>
            <Button
              onClick={triggerWebhook}
              disabled={loading || !paymentIntentId}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Processing..." : "Trigger Webhook Manually"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle>Webhook Results</CardTitle>
            </CardHeader>
            <CardContent>
              {result.error ? (
                <div className="text-red-400">
                  <div className="font-semibold">Error:</div>
                  <div>{result.error}</div>
                  {result.details && <div className="text-sm mt-2">Details: {result.details}</div>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-green-400">
                    <div className="font-semibold">✅ Success!</div>
                    <div>{result.message}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Order Number: {result.orderNumber}</div>
                    <div>Payment Intent: {result.paymentIntentId}</div>
                    <div>Order Updated: {result.result?.orderUpdated ? "Yes" : "No"}</div>
                    <div>Booking Created: {result.result?.bookingCreated ? "Yes" : "No"}</div>
                    <div>
                      Payment Status:
                      <Badge className="ml-2 bg-green-600">{result.result?.paymentStatus}</Badge>
                    </div>
                    <div>
                      Order Status:
                      <Badge className="ml-2 bg-green-600">{result.result?.orderStatus}</Badge>
                    </div>
                  </div>

                  <details>
                    <summary className="cursor-pointer font-semibold">Full Result</summary>
                    <pre className="mt-2 p-4 bg-black/50 rounded text-xs overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle>Webhook Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold">1. Check Stripe Dashboard</h3>
              <p>Go to Stripe Dashboard → Developers → Webhooks</p>
              <p>
                Make sure you have an endpoint configured for:{" "}
                <code className="bg-white/20 px-1 rounded">https://yourdomain.com/api/webhooks/stripe</code>
              </p>
            </div>

            <div>
              <h3 className="font-semibold">2. Required Events</h3>
              <p>Your webhook should listen for these events:</p>
              <ul className="list-disc list-inside ml-4">
                <li>
                  <code>payment_intent.succeeded</code>
                </li>
                <li>
                  <code>payment_intent.payment_failed</code>
                </li>
                <li>
                  <code>account.updated</code>
                </li>
                <li>
                  <code>transfer.created</code>
                </li>
                <li>
                  <code>transfer.paid</code>
                </li>
                <li>
                  <code>transfer.failed</code>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">3. Environment Variables</h3>
              <p>Make sure you have:</p>
              <ul className="list-disc list-inside ml-4">
                <li>
                  <code>STRIPE_SECRET_KEY</code>
                </li>
                <li>
                  <code>STRIPE_WEBHOOK_SECRET</code> (from webhook endpoint in Stripe)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">4. Test the Manual Trigger</h3>
              <p>
                Use your payment intent ID:{" "}
                <code className="bg-white/20 px-1 rounded">pi_3RixR24KPvm4TDMZ0qC0gQSI</code>
              </p>
              <p>This will manually process the payment and update your database.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}