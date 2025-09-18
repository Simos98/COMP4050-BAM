import { useState } from 'react';
import { Calendar } from "./ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CalendarDays, Clock, Microscope, User, LogOut } from 'lucide-react';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  bookedBy?: string;
}

interface DashboardProps {
  studentName: string;
  studentId: string;
  onLogout: () => void;
}

// Mock data for available time slots
const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 17;
  
  for (let hour = startHour; hour < endHour; hour++) {
    const timeSlot: TimeSlot = {
      id: `${date.toDateString()}-${hour}`,
      time: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`,
      available: Math.random() > 0.3, // 70% chance of being available
    };
    
    if (!timeSlot.available) {
      timeSlot.bookedBy = `Student ${Math.floor(Math.random() * 1000)}`;
    }
    
    slots.push(timeSlot);
  }
  
  return slots;
};

export function Dashboard({ studentName, studentId, onLogout }: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots(new Date()));
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setTimeSlots(generateTimeSlots(date));
    }
  };

  const handleBookSlot = (slotId: string) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === slotId 
        ? { ...slot, available: false, bookedBy: studentId }
        : slot
    ));
    setBookedSlots(prev => [...prev, slotId]);
  };

  const handleCancelBooking = (slotId: string) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === slotId 
        ? { ...slot, available: true, bookedBy: undefined }
        : slot
    ));
    setBookedSlots(prev => prev.filter(id => id !== slotId));
  };

  const myBookings = timeSlots.filter(slot => slot.bookedBy === studentId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Microscope className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold">Bioscope Wedge Dashboard</h1>
                <p className="text-sm text-muted-foreground">Book your microscope sessions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{studentName}</span>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="h-5 w-5" />
                  <span>Select Date</span>
                </CardTitle>
                <CardDescription>
                  Choose a date to view available time slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* My Bookings */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>
                  Your current reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No bookings yet</p>
                ) : (
                  <div className="space-y-2">
                    {myBookings.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{slot.time}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelBooking(slot.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Time Slots Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Available Time Slots</span>
                </CardTitle>
                <CardDescription>
                  {selectedDate 
                    ? `Time slots for ${selectedDate.toLocaleDateString()}`
                    : 'Select a date to view time slots'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {timeSlots.map((slot) => (
                      <div 
                        key={slot.id}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          slot.available 
                            ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{slot.time}</span>
                          <Badge 
                            variant={slot.available ? "default" : "destructive"}
                          >
                            {slot.available ? "Available" : "Booked"}
                          </Badge>
                        </div>
                        
                        {slot.available ? (
                          <Button 
                            className="w-full" 
                            size="sm"
                            onClick={() => handleBookSlot(slot.id)}
                          >
                            Book Slot
                          </Button>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            {slot.bookedBy === studentId ? (
                              <div className="space-y-2">
                                <p>Booked by you</p>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => handleCancelBooking(slot.id)}
                                >
                                  Cancel Booking
                                </Button>
                              </div>
                            ) : (
                              <p>Booked by {slot.bookedBy}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Please select a date to view available time slots</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}