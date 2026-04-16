<template>
  <v-app>
    <template v-if="!route.meta.public">
      <v-app-bar color="black">
        <v-app-bar-nav-icon @click="drawer = !drawer" />
        <v-app-bar-title>
          <v-icon start> mdi-account-multiple </v-icon>
          <span>Group manager</span>
        </v-app-bar-title>
        <template #append>
          <LocaleSelector />
          <ThemeToggle />
          <v-btn icon="mdi-logout" @click="handleLogout" />
        </template>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer">
        <v-list nav>
          <v-list-item
            v-for="(item, index) in nav"
            :key="`nav_item_${index}`"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            exact
          />
        </v-list>
      </v-navigation-drawer>
    </template>

    <v-main>
      <v-container :fluid="!!route.meta.public">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuth } from "@/composables/useAuth";
import LocaleSelector from "@/components/LocaleSelector.vue";
import ThemeToggle from "@/components/ThemeToggle.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { logout } = useAuth();

const drawer = ref(true);

const nav = computed(() => [
  {
    title: t("My Groups"),
    to: { name: "UserGroups", params: { user_id: "self" } },
    icon: "mdi-account",
  },
  {
    title: t("Groups"),
    to: { name: "Groups" },
    icon: "mdi-account-multiple",
  },
  {
    title: t("Create group"),
    to: { name: "CreateGroup" },
    icon: "mdi-account-multiple-plus",
  },
  {
    title: t("About"),
    to: { name: "About" },
    icon: "mdi-information-outline",
  },
]);

function handleLogout() {
  logout();
  router.push({ name: "Login" });
}
</script>

<style>
a {
  color: rgb(var(--v-theme-primary));
}

.user_picker,
.group_picker {
  height: 70vh;
}
</style>
