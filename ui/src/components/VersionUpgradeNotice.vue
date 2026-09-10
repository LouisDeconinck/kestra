<template>
    <KsAlert
        v-if="visible"
        type="info"
        :title="$t('versionUpgradeNotice.title', {version: notice!.to})"
        closable
        class="version-upgrade-notice"
        @close="dismiss"
    >
        <p>{{ $t("versionUpgradeNotice.body") }}</p>
        <a :href="migrationGuideUrl" target="_blank" rel="noopener noreferrer">
            {{ $t("versionUpgradeNotice.cta") }}
        </a>
    </KsAlert>
</template>

<script setup lang="ts">
    import {computed} from "vue"
    import {useVersionUpgradeNotice} from "../composables/useVersionUpgradeNotice"

    const {notice, visible, dismiss} = useVersionUpgradeNotice()

    // Indirect, so the target can move when the website structure changes.
    const migrationGuideUrl = computed(() => {
        const [major, minor] = (notice.value?.to ?? "").split(".")
        return `https://go.kestra.io/migration-guide/${major}.${minor}`
    })
</script>

<style lang="scss" scoped>
    .version-upgrade-notice {
        border-left: none;
        border-right: none;
        border-top: none;
        border-radius: 0;
        flex-shrink: 0;
        padding-top: var(--ks-spacing-2);
        padding-bottom: var(--ks-spacing-2);
    }
</style>
