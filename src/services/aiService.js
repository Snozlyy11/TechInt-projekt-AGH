import api from './api'

export const aiService = {
  generate: (text, count, files, difficulty = 'medium', questionType = 'single') => {
    const form = new FormData()
    form.append('count', count)
    form.append('difficulty', difficulty)
    form.append('questionType', questionType)
    if (text?.trim()) form.append('text', text.trim())
    if (files?.length) files.forEach(f => form.append('files', f))
    return api.post('/ai/generate', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },

  regenerate: (questionText, difficulty = 'medium', questionType = 'single', context = null) =>
    api.post('/ai/regenerate', { questionText, difficulty, questionType, context }),

  addToQuiz: (quizId, questions) => api.post(`/quizzes/${quizId}/questions/batch`, { questions }),
}
