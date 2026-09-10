import {computed, ref} from "vue"
import {useMiscStore} from "override/stores/misc"
import {useAuthStore} from "override/stores/auth"

const STORAGE_KEY = "kestra.versionUpgradeNotice"

// OSS has no user accounts, so every dismissal collapses onto this one key. The EE auth store
// override exposes a real id, which scopes the dismissal per account on a shared browser.
const SINGLE_USER = "local"

export interface VersionUpgrade {
    from: string
    to: string
    at: string
}

interface PersistedState {
    instanceUuid?: string
    dismissed: Record<string, string>
}

function read(): PersistedState {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")
        if (!parsed || typeof parsed !== "object" || typeof parsed.dismissed !== "object") {
            return {dismissed: {}}
        }
        return {instanceUuid: parsed.instanceUuid, dismissed: parsed.dismissed ?? {}}
    } catch {
        return {dismissed: {}}
    }
}

export function useVersionUpgradeNotice() {
    const miscStore = useMiscStore()
    const authStore = useAuthStore()

    const instanceUuid = computed<string | undefined>(() => miscStore.configs?.uuid)
    const userId = computed(() => (authStore.user as {id?: string} | undefined)?.id ?? SINGLE_USER)
    const notice = computed<VersionUpgrade | undefined>(() => miscStore.configs?.versionUpgrade)

    const stored = ref<PersistedState>(read())

    // Resolved against the live uuid rather than at load time, because configs arrive asynchronously:
    // state persisted by another instance says nothing about this one.
    const dismissedVersion = computed<string | undefined>(() => {
        const {instanceUuid: storedUuid, dismissed} = stored.value
        if (storedUuid && instanceUuid.value && storedUuid !== instanceUuid.value) {
            return undefined
        }
        return dismissed[userId.value]
    })

    const visible = computed(() => Boolean(notice.value) && dismissedVersion.value !== notice.value?.to)

    function dismiss(): void {
        if (!notice.value) {
            return
        }

        const sameInstance = !stored.value.instanceUuid
            || !instanceUuid.value
            || stored.value.instanceUuid === instanceUuid.value

        stored.value = {
            instanceUuid: instanceUuid.value ?? stored.value.instanceUuid,
            dismissed: {
                ...(sameInstance ? stored.value.dismissed : {}),
                [userId.value]: notice.value.to,
            },
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.value))
        } catch {
            // A browser refusing to persist is not a reason to keep the banner up for this session.
        }
    }

    return {notice, visible, dismiss}
}
