import { api } from './authService'

export interface AvailabilitySlot {
  _id: string
  mentorId: string
  startTime: string
  endTime: string
  isBooked: boolean
}

export interface BookingUser {
  _id: string
  name: string
  email: string
  role: string
}

export interface Booking {
  _id: string
  mentorId: BookingUser
  menteeId: BookingUser
  availabilityId: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  notes?: string
  cancellationReason?: string
  createdAt: string
}

export const schedulingService = {
  // Availability
  async addSlot(startTime: string, endTime: string): Promise<AvailabilitySlot> {
    const res = await api.post<{ status: string; data: AvailabilitySlot }>('/api/scheduling/availability', { startTime, endTime })
    return res.data.data
  },
  async getMentorSlots(mentorId: string): Promise<AvailabilitySlot[]> {
    const res = await api.get<{ status: string; data: AvailabilitySlot[] }>(`/api/scheduling/availability/${mentorId}`)
    return res.data.data
  },
  async updateSlot(id: string, startTime: string, endTime: string): Promise<AvailabilitySlot> {
    const res = await api.put<{ status: string; data: AvailabilitySlot }>(`/api/scheduling/availability/${id}`, { startTime, endTime })
    return res.data.data
  },
  async deleteSlot(id: string): Promise<void> {
    await api.delete(`/api/scheduling/availability/${id}`)
  },

  // Bookings
  async bookSlot(availabilityId: string, notes?: string): Promise<Booking> {
    const res = await api.post<{ status: string; data: Booking }>('/api/scheduling/bookings', { availabilityId, notes })
    return res.data.data
  },
  async getBookings(role: 'mentor' | 'mentee' | 'all' = 'all'): Promise<Booking[]> {
    const res = await api.get<{ status: string; data: Booking[] }>('/api/scheduling/bookings', { params: { role } })
    return res.data.data
  },
  async updateBookingStatus(id: string, status: string, cancellationReason?: string): Promise<Booking> {
    const res = await api.patch<{ status: string; data: Booking }>(`/api/scheduling/bookings/${id}`, { status, cancellationReason })
    return res.data.data
  },
}
