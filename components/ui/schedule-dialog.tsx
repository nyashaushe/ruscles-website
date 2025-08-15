import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock } from "lucide-react"
import { format, addDays, setHours, setMinutes } from "date-fns"
import { cn } from "@/lib/utils"

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSchedule: (date: Date) => void
  currentScheduledDate?: Date
  title?: string
  description?: string
}

export function ScheduleDialog({
  open,
  onOpenChange,
  onSchedule,
  currentScheduledDate,
  title = "Schedule Content",
  description = "Choose when you want this content to be published.",
}: ScheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    currentScheduledDate || addDays(new Date(), 1)
  )
  const [selectedTime, setSelectedTime] = useState<string>(
    currentScheduledDate 
      ? format(currentScheduledDate, "HH:mm")
      : "09:00"
  )
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleSchedule = () => {
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const scheduledDateTime = setMinutes(setHours(selectedDate, hours), minutes)
    onSchedule(scheduledDateTime)
    onOpenChange(false)
  }

  const quickScheduleOptions = [
    { label: "In 1 hour", date: addDays(new Date(), 0), time: format(addDays(new Date(), 0).getTime() + 3600000, "HH:mm") },
    { label: "Tomorrow 9 AM", date: addDays(new Date(), 1), time: "09:00" },
    { label: "Next Monday 9 AM", date: addDays(new Date(), (8 - new Date().getDay()) % 7), time: "09:00" },
    { label: "Next week", date: addDays(new Date(), 7), time: "09:00" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quick Schedule Options */}
          <div>
            <Label className="text-sm font-medium">Quick Schedule</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {quickScheduleOptions.map((option) => (
                <Button
                  key={option.label}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDate(option.date)
                    setSelectedTime(option.time)
                  }}
                  className="justify-start text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Custom Schedule</Label>
            
            <div className="flex gap-4">
              {/* Date Picker */}
              <div className="flex-1">
                <Label htmlFor="date" className="text-xs text-muted-foreground">
                  Date
                </Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date)
                          setCalendarOpen(false)
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="w-32">
                <Label htmlFor="time" className="text-xs text-muted-foreground">
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium">Scheduled for:</div>
            <div className="text-sm text-muted-foreground">
              {format(
                setMinutes(
                  setHours(selectedDate, parseInt(selectedTime.split(':')[0])),
                  parseInt(selectedTime.split(':')[1])
                ),
                "EEEE, MMMM do, yyyy 'at' h:mm a"
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule}>
            Schedule Content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}