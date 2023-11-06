/* typedefs from use usevue library small edits by author */
/* javascript logic expanded and changed by Ivar Strand 21.12.22 06.25
Permission control logic is changed much
includes permission status listener */
// https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query
// Permission query is experimental

import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useEventListener } from '../useEventListener'
import { usePermission } from '../usePermission'
import { useSupported } from '../useSupported'
import type { ConfigurableNavigator } from '../_configurable'
import { defaultNavigator } from '../_configurable'

export interface UseDevicesListOptions extends ConfigurableNavigator {
  onUpdated?: (devices: MediaDeviceInfo[]) => void
  /**
   * Request for permissions immediately if it's not granted,
   * otherwise label and deviceIds could be empty
   *
   * @default false
   */
  requestPermissions?: boolean
  /**
   * Request for types of media permissions
   *
   * @default { audio: true, video: true }
   */
  constraints?: MediaStreamConstraints
  /**
   * Request for types of media permissions
   *
   * @default { audio: true, video: true }
   */
  name?: String
}

export interface UseDevicesListReturn {
  /**
   * All devices, ref
   */
  audioInputs: ComputedRef<MediaDeviceInfo[]>
  audioOutputs: ComputedRef<MediaDeviceInfo[]>
  devices: Ref<MediaDeviceInfo[]>
  ensurePermissions: () => Promise<boolean>
  isSupported: Ref<boolean>
  permissionGranted: Ref<Boolean>
  state: Ref<PermissionState | undefined>
  videoInputs: ComputedRef<MediaDeviceInfo[]>
  supportedConstraints: Ref<MediaTrackSupportedConstraints | undefined>
}

/**
 *  Reactive `enumerateDevices` listing available input/output devices
 * returns devises, asks for permissions, maintains state
 */
export function useDevicesList(options: UseDevicesListOptions = {}): UseDevicesListReturn {
  const {
    navigator = defaultNavigator,
    requestPermissions = true,
    name = 'camera',
    constraints = { audio: false, video: true },
    onUpdated,
  } = options

  const devices = ref([]) as Ref<MediaDeviceInfo[]>
  const videoInputs = computed(() =>
    devices.value.filter(i => i.kind === 'videoinput'),
  )
  const audioInputs = computed(() =>
    devices.value.filter(i => i.kind === 'audioinput'),
  )
  const audioOutputs = computed(() =>
    devices.value.filter(i => i.kind === 'audiooutput'),
  )
  const supportedConstraints = ref()
  // let isSupported = false;
  const isSupported = useSupported(
    () =>
      navigator
      && navigator.mediaDevices
      && navigator.mediaDevices.enumerateDevices,
  )
  const permissionGranted = ref(false)

  async function update() {
    if (!isSupported.value)
      return
    devices.value = await navigator!.mediaDevices.enumerateDevices()
    onUpdated?.(devices.value)
    supportedConstraints.value
      = navigator!.mediaDevices.getSupportedConstraints()
  }
  // IS 221108 moved outside ensurePermissions fuction to allow subscriber to listen to state chage
  const { state, query } = usePermission(name as PermissionName, {
    controls: true,
  })

  async function ensurePermissions() {
    if (!isSupported.value)
      return false
    if (permissionGranted.value)
      return true

    //  const { state, query } = usePermission(name as PermissionName);
    /*
    const { state, query } = usePermission(name as PermissionName, {
      controls: true,
    });
    */
    await query()
    if (state.value !== 'granted') {
      const stream = await navigator!.mediaDevices.getUserMedia(constraints)
      stream.getTracks().forEach(t => t.stop())
      update()
      permissionGranted.value = true
    }
    else {
      permissionGranted.value = true
    }
    return permissionGranted.value
  }

  if (isSupported.value) {
    // ensurePermissions();
    if (requestPermissions)
      ensurePermissions()
    useEventListener(navigator!.mediaDevices, 'devicechange', update)
    update()
  }

  return {
    audioInputs,
    audioOutputs,
    devices,
    ensurePermissions,
    isSupported,
    videoInputs,
    permissionGranted,
    state,
    supportedConstraints,
  }
}

export interface UseDevicesListReturNoRef {
  /**
   * All devices, not ref
   */
  devices: MediaDeviceInfo[] // Removed the Promise type
  videoInputs: MediaDeviceInfo[]
  audioInputs: MediaDeviceInfo[]
  audioOutputs: MediaDeviceInfo[]
  isSupported: Boolean
}

/**
 * Used by permissions API, usePermissions
 */
export async function getDevicesList(
  options: UseDevicesListOptions = {},
): Promise<UseDevicesListReturNoRef> {
  const { onUpdated } = options

  let devicesList: MediaDeviceInfo[] = []
  let isSupported = false

  if (navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    isSupported = true

    devicesList = await navigator.mediaDevices.enumerateDevices()
    onUpdated?.(devicesList)
  }

  const videoInputs = devicesList.filter(i => i.kind === 'videoinput')
  const audioInputs = devicesList.filter(i => i.kind === 'audioinput')
  const audioOutputs = devicesList.filter(i => i.kind === 'audiooutput')

  return {
    devices: devicesList,
    videoInputs,
    audioInputs,
    audioOutputs,
    isSupported,
  }
}

/**
 * returns devises async as vanilla js
 *
 *
 */
/*
export const useDevicesListNoRefs = async (
  options: UseDevicesListOptions = {}
): Promise<UseDevicesListReturNoRef> => {
  const {
    name = "camera",
    constraints = { audio: false, video: true },
    onUpdated,
  } = options;
  let devices = [] as MediaDeviceInfo[];
  const videoInputs = devices.filter((i) => i.kind === "videoinput");
  const audioInputs = devices.filter((i) => i.kind === "audioinput");
  const audioOutputs = devices.filter((i) => i.kind === "audiooutput");
  let isSupported = false;
  let permissionGranted = false;

  async function update() {
    if (!isSupported) return;

    devices = await navigator!.mediaDevices.enumerateDevices();
    onUpdated?.(devices);
  }

  async function ensurePermissions() {
    if (!isSupported) return false;

    if (permissionGranted) return true;

    const { state, query } = usePermission(name);
    await query();
    if (state.value !== "granted") {
      const stream = await navigator!.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach((t) => t.stop());
      update();
      permissionGranted = true;
    } else {
      permissionGranted = true;
    }

    return permissionGranted;
  }

  if (navigator) {
    isSupported = Boolean(
      navigator.mediaDevices && navigator.mediaDevices.enumerateDevices
    );
    if (isSupported) {
      ensurePermissions();
      useEventListener(navigator.mediaDevices, "devicechange", update);
      update();
    }
  }

  return {
    devices,
    videoInputs,
    audioInputs,
    audioOutputs,
    isSupported,
    permissionGranted,
  };
};
*/
