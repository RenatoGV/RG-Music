/** Lets the current interaction state render before starting synchronous work. */
export const deferUntilAfterPaint = (task: () => void) => {
  requestAnimationFrame(() => requestAnimationFrame(task))
}
