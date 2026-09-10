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

    // Guides are published per minor release, always with a .0 patch: /docs/migration-guide/v2.0.0.
    const migrationGuideUrl = computed(() => {
        const [major, minor] = (notice.value?.to ?? "").split(".")
        return `https://kestra.io/docs/migration-guide/v${major}.${minor}.0`
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
