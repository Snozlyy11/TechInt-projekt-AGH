import api from './api'

export const sessionService = {
  create:  (quizId)           => api.post('/sessions', { quizId }),
  get:     (code)             => api.get(`/sessions/${code}`),
  submit:  (code, name, answers) => api.post(`/sessions/${code}/submit`, { name, answers }),
  results: (code)             => api.get(`/sessions/${code}/results`),
  close:   (code)             => api.delete(`/sessions/${code}`),
}
