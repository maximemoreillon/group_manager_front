<template>
  <v-data-table-server v-bind="$attrs" :headers="headers">
    <template #item.avatar="props">
      <slot name="item.avatar" v-bind="props">
        <v-img
          v-if="props.item.avatar_src"
          contain
          width="2em"
          height="2em"
          :src="props.item.avatar_src"
        />
        <v-icon v-else>mdi-account-multiple</v-icon>
      </slot>
    </template>

    <template #item.name="props">
      <slot name="item.name" v-bind="props">
        <router-link
          :to="{ name: 'Group', params: { group_id: props.item._id } }"
        >
          {{ props.item.name }}
        </router-link>
      </slot>
    </template>

    <template #item.official="props">
      <slot name="item.official" v-bind="props">
        <v-icon v-if="props.item.official">mdi-check-decagram</v-icon>
      </slot>
    </template>

    <template #item.restricted="props">
      <slot name="item.restricted" v-bind="props">
        <v-icon v-if="props.item.restricted">mdi-lock</v-icon>
      </slot>
    </template>

    <template #item.hidden="props">
      <slot name="item.hidden" v-bind="props">
        <v-icon v-if="props.item.hidden">mdi-eye-off</v-icon>
      </slot>
    </template>

    <!-- Pass through all other slots (e.g. #top, #item.delete) -->
    <template v-for="(_, name) in passthroughSlots" v-slot:[name]="props">
      <slot :name="name" v-bind="props ?? {}" />
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";
import { useI18n } from "vue-i18n";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  extraHeaders?: any[];
}>();

const { t } = useI18n();
const slots = useSlots();

const defaultHeaders = computed(() => [
  {
    key: "avatar",
    title: "",
    width: "50px",
    sortable: false,
    align: "center" as const,
  },
  { key: "name", title: t("Name"), sortable: false },
  {
    key: "official",
    title: t("Official"),
    sortable: false,
    align: "center" as const,
  },
  {
    key: "restricted",
    title: t("Restricted"),
    sortable: false,
    align: "center" as const,
  },
  {
    key: "hidden",
    title: t("Hidden"),
    sortable: false,
    align: "center" as const,
  },
]);

const headers = computed(() =>
  props.extraHeaders
    ? [...defaultHeaders.value, ...props.extraHeaders]
    : defaultHeaders.value,
);

const ownSlots = new Set([
  "item.avatar",
  "item.name",
  "item.official",
  "item.restricted",
  "item.hidden",
]);

const passthroughSlots = computed(() =>
  Object.fromEntries(
    Object.entries(slots).filter(([name]) => !ownSlots.has(name)),
  ),
);
</script>
