import { useSyncExternalStore } from "react"

// Include phones in landscape without changing desktop mouse layouts.
const query = "(max-width: 900px), (max-width: 1100px) and (pointer: coarse)"
const subscribe = (onChange) => {
  const media = window.matchMedia(query)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}
const getSnapshot = () => window.matchMedia(query).matches

export function useMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
