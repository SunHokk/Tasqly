// Hitung priority score berdasarkan importance dan deadline
export function calculatePriorityScore(importance, deadline) {
  const importanceScore = importance * 0.6

  let deadlineScore = 0
  if (deadline) {
    const diff = new Date(deadline) - new Date()
    const days = diff / (1000 * 60 * 60 * 24)

    if (diff < 0) deadlineScore = 5          // sudah lewat deadline
    else if (days <= 1) deadlineScore = 4    // besok
    else if (days <= 3) deadlineScore = 3    // 3 hari
    else if (days <= 7) deadlineScore = 2    // 7 hari
    else deadlineScore = 1                   // lebih dari 7 hari
  }

  return Math.round((importanceScore + deadlineScore * 0.4) * 10) / 10
}

// Konversi score ke label
export function getPriorityLabel(score) {
  if (score >= 4) return { label: 'High', color: 'red' }
  if (score >= 2.5) return { label: 'Medium', color: 'orange' }
  return { label: 'Low', color: 'green' }
}