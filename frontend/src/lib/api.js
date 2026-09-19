import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hr_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hr_token')
      localStorage.removeItem('hr_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
  logout:   ()     => api.post('/auth/logout'),
}

export const incidentsAPI = {
  getAll:       (params)  => api.get('/incidents', { params }),
  getById:      (id)      => api.get(`/incidents/${id}`),
  create:       (data)    => api.post('/incidents', data),
  update:       (id, d)   => api.patch(`/incidents/${id}`, d),
  delete:       (id)      => api.delete(`/incidents/${id}`),
  assignTeam:   (id, d)   => api.post(`/incidents/${id}/assign`, d),
  updateStatus: (id, d)   => api.patch(`/incidents/${id}/status`, d),
}

export const survivorsAPI = {
  getAll:       (params) => api.get('/survivors', { params }),
  getById:      (id)     => api.get(`/survivors/${id}`),
  create:       (data)   => api.post('/survivors', data),
  update:       (id, d)  => api.patch(`/survivors/${id}`, d),
  updateStatus: (id, d)  => api.patch(`/survivors/${id}/status`, d),
}

export const teamsAPI = {
  getAll:    (params) => api.get('/teams', { params }),
  getById:   (id)     => api.get(`/teams/${id}`),
  create:    (data)   => api.post('/teams', data),
  update:    (id, d)  => api.patch(`/teams/${id}`, d),
  updateLoc: (id, d)  => api.patch(`/teams/${id}/location`, d),
}

export const resourcesAPI = {
  getAll:   (params) => api.get('/resources', { params }),
  create:   (data)   => api.post('/resources', data),
  update:   (id, d)  => api.patch(`/resources/${id}`, d),
  allocate: (id, d)  => api.post(`/resources/${id}/allocate`, d),
}

export const dashboardAPI = {
  getStats:    () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
}
