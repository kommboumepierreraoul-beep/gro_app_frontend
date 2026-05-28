// =============================================================================
import api from '@/lib/axios'
import { Announcement, Paginated} from '@/types/community.types'
 
export const announcementService = {
 
  async getAll(category?: string, page = 1): Promise<Paginated<Announcement>> {
    const params = new URLSearchParams({ page: String(page) })
    if (category) params.append('category', category)
    const res = await api.get(`/community/announcements?${params}`)
    return res.data.data
  },
 
  async getOne(id: number): Promise<Announcement> {
    const res = await api.get(`/announcements/${id}`)
    return res.data.data
  },
 
  async create(data: FormData): Promise<Announcement> {
    const res = await api.post('/community/announcements', data);
    return res.data.data
  },
 
  async delete(id: number): Promise<void> {
    await api.delete(`/community/announcements/${id}`)
  },
 
  async toggleLike(id: number): Promise<{ liked: boolean; likes_count: number }> {
    const res = await api.post(`/community/announcements/${id}/like`)
    return res.data
  },
}