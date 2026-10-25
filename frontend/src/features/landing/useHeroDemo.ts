import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/motion'

export const STAGES = ['typing', 'sent', 'searching', 'answer', 'source'] as const
export type Stage = (typeof STAGES)[number]

/**
 * Scripted, looping product walkthrough for the hero.
 * Mirrors the real flow: question -> pending -> complete answer (no token streaming) -> source.
 * Under reduced motion, or when paused, it rests on the final state.
 */
export function useHeroDemo(question: string) {
  const reduced = usePrefersReducedMotion()
  const [paused, setPaused] = useState(false)
  const [liveStage, setStage] = useState<Stage>('source')
  const [liveTyped, setTyped] = useState('')

  const running = !reduced && !paused
  // When not running (reduced motion or paused) rest on the finished state.
  const stage: Stage = running ? liveStage : 'source'
  const typed = running ? liveTyped : ''

  useEffect(() => {
    if (!running) return

    let alive = true
    const timers: number[] = []
    const at = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(() => alive && fn(), ms))
    }

    const run = () => {
      setStage('typing')
      setTyped('')
      let i = 0
      const tick = () => {
        i += 1
        setTyped(question.slice(0, i))
        if (i < question.length) {
          at(42, tick)
          return
        }
        at(550, () => {
          setStage('sent')
          setTyped('')
          at(700, () => {
            setStage('searching')
            at(1700, () => {
              setStage('answer')
              at(1100, () => {
                setStage('source')
                at(7000, run)
              })
            })
          })
        })
      }
      at(800, tick)
    }

    run()
    return () => {
      alive = false
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [running, question])

  return {
    stage,
    typed,
    reduced,
    paused,
    toggle: () => setPaused((p) => !p),
    reached: (s: Stage) => STAGES.indexOf(stage) >= STAGES.indexOf(s),
  }
}
