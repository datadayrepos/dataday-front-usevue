import type { Ref } from 'vue'
import { ref } from 'vue'
import { tryOnMounted } from '@datadayrepos/usevueshared'

export function useSupported(callback: () => unknown, sync = false) {
  const isSupported = ref() as Ref<boolean>

  const update = () => (isSupported.value = Boolean(callback()))

  update()

  tryOnMounted(update, sync)
  return isSupported
}
