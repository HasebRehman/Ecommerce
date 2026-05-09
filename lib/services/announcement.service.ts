import api from '@/lib/axios'
import { API } from '@/constants/api'
import type {
  Announcement,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
} from '@/types'

export const announcementService = {

  // Create a new announcement (super_admin / platform_admin only)
  async create(payload: CreateAnnouncementPayload): Promise<Announcement> {
    const res = await api.post(API.ANNOUNCEMENTS.CREATE, payload)
    return res.data.announcement
  },

  // List all announcements (super_admin / platform_admin only)
  async list(): Promise<Announcement[]> {
    const res = await api.get(API.ANNOUNCEMENTS.LIST)
    return res.data.announcements
  },

  // Get published announcements filtered by the caller's role
  async getActive(): Promise<Announcement[]> {
    const res = await api.get(API.ANNOUNCEMENTS.ACTIVE)
    return res.data.announcements
  },

  // Update an existing announcement (super_admin / platform_admin only)
  async update(id: string, payload: UpdateAnnouncementPayload): Promise<Announcement> {
    const res = await api.patch(API.ANNOUNCEMENTS.DETAIL(id), payload)
    return res.data.announcement
  },

}
