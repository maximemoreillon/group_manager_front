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
    themes: {
      light: { colors: { primary: "#c00000" } },
      dark: { colors: { primary: "#c00000" } },
    },
  },
});
