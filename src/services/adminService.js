import api from './api'

export const adminService = {
  getUsers:    ()       => api.get('/admin/users'),
  deleteQuiz:  (id)     => api.delete(`/admin/quizzes/${id}`),
}
