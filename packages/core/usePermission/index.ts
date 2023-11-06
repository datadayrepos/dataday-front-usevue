/*  Ivar Strand 21.12.09 08.50 */
/* adapted from vueuse package */
import { ref } from 'vue'
import type { Ref } from 'vue'

import { createSingletonPromise } from '@datadayrepos/usevueshared' // shared
import { useEventListener } from '../useEventListener'
import { defaultNavigator } from '../_configurable'
import { useSupported } from '../useSupported'
import type { ConfigurableNavigator } from '../_configurable'

type DescriptorNamePolyfill =
  | 'accelerometer'
  | 'accessibility-events'
  | 'ambient-light-sensor'
  | 'background-sync'
  | 'camera'
  | 'clipboard-read'
  | 'clipboard-write'
  | 'gyroscope'
  | 'magnetometer'
  | 'microphone'
  | 'notifications'
  | 'payment-handler'
  | 'persistent-storage'
  | 'push'
  | 'speaker'

export type GeneralPermissionDescriptor =
  | PermissionDescriptor
  | { name: DescriptorNamePolyfill }

export interface UsePermissionOptions<Controls extends boolean>
  extends ConfigurableNavigator {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls
}

export type UsePermissionReturn = Readonly<Ref<PermissionState | undefined>>

export interface UsePermissionReturnWithControls {
  state: UsePermissionReturn
  isSupported: Ref<boolean>
  query: () => Promise<PermissionStatus | undefined>
}

/**
 *Permission handler
 *returns promise obj 'granted' | 'denied' |'prompt'
 *obj
 */
export async function getAllPermissonsState() {
  const names = [
    'accelerometer',
    'ambient-light-sensor',
    'background-fetch',
    'background-sync',
    'bluetooth',
    'camera',
    'clipboard-read',
    'clipboard-write',
    'display-capture',
    'geolocation',
    'gyroscope',
    'magnetometer',
    'microphone',
    'midi',
    'nfc',
    'notifications',
    'persistent-storage',
    'push',
    'screen-wake-lock',
    'speaker',
    'speaker-selection',
    'xr-spatial-tracking',
  ]

  const permStateObj: Partial<Record<PermissionName, { state: any }>> & { err: any[] } = { err: [] }

  for (let i = 0; i < names.length; i++) {
    try {
      const n = names[i] as PermissionName

      const ps = await navigator.permissions.query({ name: n })
      permStateObj[n] = { state: ps.state }
    }
    catch (e) {
      permStateObj.err.push(
        names[i], // e.message
      )
    }
  }
  return permStateObj
}

/**
 *Permission handler
 *returns promise obj 'granted' | 'denied' |'prompt'
 *@Params name strring
 */
export async function getNamedPermissonState(name: string) {
  try {
    const n = name as PermissionName
    const ps = await navigator.permissions.query({ name: n })
    return ps.state
  }
  catch (e) {
    return 'prompt'
  }
}

/**
 *Permission handler
 *
 *@Params name string -name of browser api to call for permission
 */
export function usePermission(
  permissionDesc:
  | GeneralPermissionDescriptor
  | GeneralPermissionDescriptor['name'],
  options?: UsePermissionOptions<false>
): UsePermissionReturn

export function usePermission(
  permissionDesc:
  | GeneralPermissionDescriptor
  | GeneralPermissionDescriptor['name'],
  options: UsePermissionOptions<true>
): UsePermissionReturnWithControls
export function usePermission(
  permissionDesc:
  | GeneralPermissionDescriptor
  | GeneralPermissionDescriptor['name'],
  options: UsePermissionOptions<boolean> = {},
): UsePermissionReturn | UsePermissionReturnWithControls {
  const { controls = false, navigator = defaultNavigator } = options

  const isSupported = useSupported(
    () => navigator && 'permissions' in navigator,
  )
  let permissionStatus: PermissionStatus | undefined

  const desc
    = typeof permissionDesc === 'string'
      ? ({ name: permissionDesc } as PermissionDescriptor)
      : (permissionDesc as PermissionDescriptor)

  const state = ref<PermissionState | undefined>()

  const onChange = () => {
    if (permissionStatus)
      state.value = permissionStatus.state
  }

  const query = createSingletonPromise(async () => {
    if (!isSupported.value)
      return
    if (!permissionStatus) {
      try {
        permissionStatus = await navigator!.permissions.query(desc)
        useEventListener(permissionStatus, 'change', onChange)
        onChange()
      }
      catch {
        state.value = 'prompt'
      }
    }
    return permissionStatus
  })
  query()

  if (controls) {
    return {
      state: state as UsePermissionReturn,
      isSupported,
      query,
    }
  }
  else {
    return state as UsePermissionReturn
  }
}
