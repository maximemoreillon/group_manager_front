import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";

export default createVuetify({
  defaults: {
    VSwitch: {
      color: "primary",
    },
    VTextField: {
      variant: "underlined",
    },
  },
  theme: {
    defaultTheme: localStorage.getItem("theme") || "light",
    themes: {
      light: { colors: { primary: "#c00000", background: "#f5f5f5" } },
      dark: { colors: { primary: "#c00000" } },
    },
  },
});
