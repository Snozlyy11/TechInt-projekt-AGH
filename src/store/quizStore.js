import { create } from 'zustand'

const emptyQuestion = (id) => ({
  id,
  text: '',
  type: 'single',
  points: 1,
  required: false,
  imageUrl: null,
  options: [
    { id: 'a', label: 'A', text: '', correct: false },
    { id: 'b', label: 'B', text: '', correct: false },
    { id: 'c', label: 'C', text: '', correct: false },
    { id: 'd', label: 'D', text: '', correct: false },
  ],
})

const trueFalseOptions = () => [
  { id: 'tf-a', label: 'A', text: 'Prawda', correct: false },
  { id: 'tf-b', label: 'B', text: 'Fałsz',  correct: false },
]

const defaultOptions = () => [
  { id: crypto.randomUUID(), label: 'A', text: '', correct: false },
  { id: crypto.randomUUID(), label: 'B', text: '', correct: false },
  { id: crypto.randomUUID(), label: 'C', text: '', correct: false },
  { id: crypto.randomUUID(), label: 'D', text: '', correct: false },
]

export const useQuizStore = create((set, get) => ({
  quiz: {
    id: null,
    title: 'Nowy quiz',
    description: '',
    timeLimit: null,
    published: false,
    bannerUrl: null,
  },
  questions: [emptyQuestion(crypto.randomUUID())],
  activeQuestionId: null,

  setQuiz(quiz) { set({ quiz: { ...get().quiz, ...quiz } }) },
  setQuizField(key, value) { set((s) => ({ quiz: { ...s.quiz, [key]: value } })) },

  setActiveQuestion(id) { set({ activeQuestionId: id }) },

  addQuestion() {
    const q = emptyQuestion(crypto.randomUUID())
    set((s) => ({ questions: [...s.questions, q], activeQuestionId: q.id }))
  },

  removeQuestion(id) {
    set((s) => {
      const filtered = s.questions.filter((q) => q.id !== id)
      const removedIdx = s.questions.findIndex((q) => q.id === id)
      const nextId = filtered.length
        ? (filtered[removedIdx] ?? filtered[removedIdx - 1])?.id ?? null
        : null
      return { questions: filtered, activeQuestionId: nextId }
    })
  },

  updateQuestion(id, patch) {
    set((s) => ({
      questions: s.questions.map((q) => {
        if (q.id !== id) return q
        let updated = { ...q, ...patch }
        if (patch.type === 'truefalse') {
          updated.options = trueFalseOptions()
        } else if (q.type === 'truefalse' && (patch.type === 'single' || patch.type === 'multiple')) {
          updated.options = defaultOptions()
        }
        return updated
      }),
    }))
  },

  updateOption(questionId, optionId, patch) {
    set((s) => ({
      questions: s.questions.map((q) => {
        if (q.id !== questionId) return q
        return {
          ...q,
          options: q.options.map((o) => (o.id === optionId ? { ...o, ...patch } : o)),
        }
      }),
    }))
  },

  setCorrect(questionId, optionId) {
    set((s) => ({
      questions: s.questions.map((q) => {
        if (q.id !== questionId) return q
        const isSingle = q.type === 'single' || q.type === 'truefalse'
        return {
          ...q,
          options: q.options.map((o) => ({
            ...o,
            correct: o.id === optionId ? !o.correct : isSingle ? false : o.correct,
          })),
        }
      }),
    }))
  },

  reorderQuestions(questions) { set({ questions }) },

  loadQuiz(quiz, questions) {
    set({ quiz, questions, activeQuestionId: questions[0]?.id ?? null })
  },

  reset() {
    const q = emptyQuestion(crypto.randomUUID())
    set({
      quiz: { id: null, title: 'Nowy quiz', description: '', timeLimit: null, published: false, bannerUrl: null },
      questions: [q],
      activeQuestionId: q.id,
    })
  },
}))
