import api from './api'

export const quizService = {
  list:    ()         => api.get('/quizzes'),
  copy:    (id)       => api.post(`/quizzes/${id}/copy`),
  catalog: ()         => api.get('/quizzes/public'),
  get:     (id)       => api.get(`/quizzes/${id}`),
  create:  (data)     => api.post('/quizzes', data),
  update:  (id, data) => api.put(`/quizzes/${id}`, data),
  remove:  (id)       => api.delete(`/quizzes/${id}`),
  submit:  (id, ans)  => api.post(`/quizzes/${id}/submit`, { answers: ans }),
  results: (id)       => api.get(`/quizzes/${id}/results`),
}
