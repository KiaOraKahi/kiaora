"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Clock, Plus, Download, Share2, Bell, Video, Mail, ExternalLink } from "lucide-react"
import { format, addDays, isSameDay } from "date-fns"
import { useToast } from "@/components/frontend/toast-provider"

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: Date
  time: string
  duration: number
  type: "delivery" | "call" | "reminder" | "deadline"
  celebrity?: {
    name: string
    image: string
  }
  status: "scheduled" | "confirmed" | "completed" | "cancelled"
  location?: string
  meetingLink?: string
  reminderSet?: boolean
}

const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Emma Stone Video Delivery",
    description: "Birthday message for Sarah's 25th birthday",
    date: addDays(new Date(), 2),
    time: "2:00 PM",
    duration: 0,
    type: "delivery",
    celebrity: {
      name: "Emma Stone",
      image: "/placeholder.svg?height=40&width=40",
    },
    status: "scheduled",
  },
  {
    id: "2",
            title: "Live Call with Sarah",
    description: "Anniversary surprise call",
    date: addDays(new Date(), 5),
    time: "7:00 PM",
    duration: 15,
    type: "call",
    celebrity: {
              name: "Sarah",
      image: "/placeholder.svg?height=40&width=40",
    },
    status: "confirmed",
    meetingLink: "https://meet.kiaora.com/john-legend-call",
    reminderSet: true,
  },
  {
    id: "3",
    title: "Booking Deadline Reminder",
    description: "Last day to book Tony Robbins for graduation",
    date: addDays(new Date(), 7),
    time: "11:59 PM",
    duration: 0,
    type: "reminder",
    status: "scheduled",
  },
]

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
]

export default function CalendarIntegration() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const { addToast } = useToast()

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date(),
    time: "12:00 PM",
    type: "reminder" as CalendarEvent["type"],
  })

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date))
  }

  const getEventTypeColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "delivery":
        return "from-blue-500 to-cyan-500"
      case "call":
        return "from-purple-500 to-pink-500"
      case "reminder":
        return "from-yellow-500 to-orange-500"
      case "deadline":
        return "from-red-500 to-rose-500"
      default:
        return "from-gray-500 to-slate-500"
    }
  }

  const getEventTypeIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "delivery":
        return <Mail className="w-4 h-4" />
      case "call":
        return <Video className="w-4 h-4" />
      case "reminder":
        return <Bell className="w-4 h-4" />
      case "deadline":
        return <Clock className="w-4 h-4" />
      default:
        return <CalendarIcon className="w-4 h-4" />
    }
  }

  const handleAddEvent = () => {
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      duration: 0,
      type: newEvent.type,
      status: "scheduled",
    }

    setEvents((prev) => [...prev, event])
    setNewEvent({
      title: "",
      description: "",
      date: new Date(),
      time: "12:00 PM",
      type: "reminder",
    })
    setShowAddEvent(false)

    addToast({
      type: "success",
      title: "Event Added",
      description: "Your calendar event has been created successfully!",
    })
  }

  const handleSetReminder = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === eventId ? { ...event, reminderSet: !event.reminderSet } : event)),
    )

    addToast({
      type: "success",
      title: "Reminder Set",
      description: "You'll be notified 1 hour before this event.",
    })
  }

  const exportToCalendar = (event: CalendarEvent) => {
    const startDate = new Date(event.date)
    const [time, period] = event.time.split(" ")
    const [hours, minutes] = time.split(":")
    let hour = Number.parseInt(hours)
    if (period === "PM" && hour !== 12) hour += 12
    if (period === "AM" && hour === 12) hour = 0

    startDate.setHours(hour, Number.parseInt(minutes))
    const endDate = new Date(startDate.getTime() + (event.duration || 60) * 60000)

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title,
    )}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(
      event.description,
    )}&location=${encodeURIComponent(event.location || "")}`

    window.open(calendarUrl, "_blank")

    addToast({
      type: "success",
      title: "Calendar Export",
      description: "Event exported to Google Calendar!",
    })
  }

  const shareEvent = (event: CalendarEvent) => {
    const shareText = `${event.title} - ${format(event.date, "MMM d, yyyy")} at ${event.time}`

    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: shareText,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      addToast({
        type: "success",
        title: "Event Copied",
        description: "Event details copied to clipboard!",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Calendar</h2>
          <p className="text-purple-200">Manage your celebrity bookings and events</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              <SelectItem value="month">Month View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="day">Day View</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setShowAddEvent(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full"
                modifiers={{
                  hasEvents: (date) => getEventsForDate(date).length > 0,
                }}
                modifiersStyles={{
                  hasEvents: {
                    backgroundColor: "rgba(139, 92, 246, 0.3)",
                    color: "white",
                    fontWeight: "bold",
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Events Sidebar */}
        <div className="space-y-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {format(selectedDate, "MMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-purple-200 text-center py-4">No events scheduled</p>
              ) : (
                getEventsForDate(selectedDate).map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getEventTypeColor(event.type)}`} />
                            <h4 className="text-white font-semibold text-sm">{event.title}</h4>
                          </div>
                          <Badge
                            className={`text-xs ${
                              event.status === "confirmed"
                                ? "bg-green-500/20 text-green-300"
                                : event.status === "completed"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : event.status === "cancelled"
                                    ? "bg-red-500/20 text-red-300"
                                    : "bg-yellow-500/20 text-yellow-300"
                            }`}
                          >
                            {event.status}
                          </Badge>
                        </div>

                        <p className="text-purple-200 text-xs mb-2">{event.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-purple-300 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{event.time}</span>
                          </div>

                          {event.celebrity && (
                            <div className="flex items-center gap-1">
                              <img
                                src={event.celebrity.image || "/placeholder.svg"}
                                alt={event.celebrity.name}
                                className="w-4 h-4 rounded-full"
                              />
                              <span className="text-purple-300 text-xs">{event.celebrity.name}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => setShowAddEvent(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {
                  // Export all events
                  addToast({
                    type: "success",
                    title: "Calendar Exported",
                    description: "All events exported to your calendar app!",
                  })
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Calendar
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {
                  addToast({
                    type: "info",
                    title: "Sync Enabled",
                    description: "Calendar sync with Google Calendar enabled!",
                  })
                }}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Sync with Google
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-white/20 rounded-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getEventTypeColor(selectedEvent.type)}`} />
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedEvent.title}</h3>
                    <p className="text-purple-200 text-sm">{selectedEvent.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedEvent(null)}
                  className="text-white hover:bg-white/10"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-purple-200">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{format(selectedEvent.date, "EEEE, MMMM d, yyyy")}</span>
                </div>

                <div className="flex items-center gap-3 text-purple-200">
                  <Clock className="w-4 h-4" />
                  <span>{selectedEvent.time}</span>
                  {selectedEvent.duration > 0 && <span>({selectedEvent.duration} minutes)</span>}
                </div>

                {selectedEvent.celebrity && (
                  <div className="flex items-center gap-3 text-purple-200">
                    <img
                      src={selectedEvent.celebrity.image || "/placeholder.svg"}
                      alt={selectedEvent.celebrity.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{selectedEvent.celebrity.name}</span>
                  </div>
                )}

                {selectedEvent.meetingLink && (
                  <div className="flex items-center gap-3 text-purple-200">
                    <Video className="w-4 h-4" />
                    <a
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Join Meeting
                    </a>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Badge
                    className={`${
                      selectedEvent.status === "confirmed"
                        ? "bg-green-500/20 text-green-300"
                        : selectedEvent.status === "completed"
                          ? "bg-blue-500/20 text-blue-300"
                          : selectedEvent.status === "cancelled"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {selectedEvent.status}
                  </Badge>

                  {selectedEvent.reminderSet && (
                    <Badge className="bg-purple-500/20 text-purple-300">
                      <Bell className="w-3 h-3 mr-1" />
                      Reminder Set
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => handleSetReminder(selectedEvent.id)}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {selectedEvent.reminderSet ? "Remove Reminder" : "Set Reminder"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => exportToCalendar(selectedEvent)}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>

                <Button
                  variant="outline"
                  onClick={() => shareEvent(selectedEvent)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddEvent(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-white/20 rounded-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Add New Event</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-purple-300"
                    placeholder="Event title"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-purple-300 resize-none"
                    rows={3}
                    placeholder="Event description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Date</label>
                    <input
                      type="date"
                      value={format(newEvent.date, "yyyy-MM-dd")}
                      onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Time</label>
                    <Select value={newEvent.time} onValueChange={(value) => setNewEvent({ ...newEvent, time: value })}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value: any) => setNewEvent({ ...newEvent, type: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddEvent(false)}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddEvent}
                  disabled={!newEvent.title.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Add Event
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}