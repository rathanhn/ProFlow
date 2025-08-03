'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Filter,
  Users,
  FileText
} from 'lucide-react';
import { getTasks } from '@/lib/firebase-service';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'meeting' | 'milestone' | 'reminder';
  status: 'upcoming' | 'overdue' | 'completed';
  clientName?: string;
  description?: string;
}

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterType, setFilterType] = useState<'all' | 'deadline' | 'meeting' | 'milestone'>('all');

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      const tasks = await getTasks();
      
      // Convert tasks to calendar events
      const calendarEvents: CalendarEvent[] = tasks.map(task => ({
        id: task.id,
        title: task.projectName,
        date: task.submissionDate,
        type: 'deadline',
        status: task.workStatus === 'completed' ? 'completed' : 
                new Date(task.submissionDate) < new Date() ? 'overdue' : 'upcoming',
        clientName: task.clientName,
        description: `Task deadline for ${task.projectName}`
      }));

      // Add some mock events for demo
      const mockEvents: CalendarEvent[] = [
        {
          id: 'meeting-1',
          title: 'Client Review Meeting',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'meeting',
          status: 'upcoming',
          clientName: 'Tech Solutions Ltd',
          description: 'Review project progress and discuss next steps'
        },
        {
          id: 'milestone-1',
          title: 'Q1 Revenue Target',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'milestone',
          status: 'upcoming',
          description: 'Quarterly revenue milestone review'
        }
      ];

      setEvents([...calendarEvents, ...mockEvents]);
    } catch (error) {
      console.error('Failed to load calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateString;
    });
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.status === 'overdue') return 'bg-red-100 text-red-800 border-red-200';
    if (event.status === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    
    switch (event.type) {
      case 'deadline': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'milestone': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'deadline': return Clock;
      case 'meeting': return Users;
      case 'milestone': return CheckCircle;
      default: return FileText;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredEvents = events.filter(event => 
    filterType === 'all' || event.type === filterType
  );

  const upcomingEvents = filteredEvents
    .filter(event => event.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const overdueEvents = filteredEvents.filter(event => event.status === 'overdue');

  return (
    <DashboardLayout>
      <div className="space-y-6 fab-safe-bottom">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              View deadlines and schedule overview
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={(value: 'all' | 'deadline' | 'meeting' | 'milestone') => setFilterType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="milestone">Milestones</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((day, index) => {
                    if (!day) {
                      return <div key={index} className="p-2 h-24"></div>;
                    }
                    
                    const dayEvents = getEventsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    
                    return (
                      <div 
                        key={index} 
                        className={`p-2 h-24 border rounded-lg hover:bg-muted/50 transition-colors ${
                          isToday ? 'bg-primary/10 border-primary' : 'border-border'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-primary' : 'text-foreground'
                        }`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => {
                            const Icon = getEventIcon(event.type);
                            return (
                              <div 
                                key={event.id}
                                className={`text-xs p-1 rounded border ${getEventColor(event)} truncate`}
                                title={event.title}
                              >
                                <div className="flex items-center gap-1">
                                  <Icon className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{event.title}</span>
                                </div>
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No upcoming events</p>
                  ) : (
                    upcomingEvents.map(event => {
                      const Icon = getEventIcon(event.type);
                      return (
                        <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                          <div className={`p-1 rounded border ${getEventColor(event)}`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()}
                            </p>
                            {event.clientName && (
                              <p className="text-xs text-muted-foreground">{event.clientName}</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Overdue Items */}
            {overdueEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Overdue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overdueEvents.map(event => {
                      const Icon = getEventIcon(event.type);
                      return (
                        <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg bg-red-50 border border-red-200">
                          <div className="p-1 rounded border bg-red-100 text-red-800 border-red-200">
                            <Icon className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-red-800">{event.title}</p>
                            <p className="text-xs text-red-600">
                              Due: {new Date(event.date).toLocaleDateString()}
                            </p>
                            {event.clientName && (
                              <p className="text-xs text-red-600">{event.clientName}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total Events</span>
                    <span className="font-semibold">{filteredEvents.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Upcoming</span>
                    <span className="font-semibold text-blue-600">
                      {filteredEvents.filter(e => e.status === 'upcoming').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Overdue</span>
                    <span className="font-semibold text-red-600">
                      {overdueEvents.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span className="font-semibold text-green-600">
                      {filteredEvents.filter(e => e.status === 'completed').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
