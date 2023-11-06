import { defineComponent, reactive } from 'vue'
import { useToggle } from '@datadayrepos/usevueshared'
import { useDark } from './index'
import type { UseDarkOptions } from './index'

export const UseDark = defineComponent<UseDarkOptions>({
  name: 'UseDark',
  props: [
    'selector',
    'attribute',
    'valueDark',
    'valueLight',
    'onChanged',
    'storageKey',
    'storage',
  ] as unknown as undefined,
  setup(props, { slots }) {
    const isDark = useDark(props)
    const data = reactive({
      isDark,
      toggleDark: useToggle(isDark),
    })

    return () => {
      if (slots.default)
        return slots.default(data)
    }
  },
})
