import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";

export default createVuetify({
  defaults: {
    VSwitch: {
      color: "primary",
    },
    VTextField: {
      // variant: "outlined",
      variant: "underlined",
    },
    VSelect: {
      variant: "outlined",
      // variant: "underlined",
    },
  },
  theme: {
    defaultTheme: localStorage.getItem("theme") || "light",
    themes: {
      light: {
        colors: {
          primary: "#c00000",
          background: "#fafafa",
          "app-bar": "#000000",
        },
      },
      dark: { colors: { primary: "#c00000", "app-bar": "#2a2a2a" } },
    },
  },
});
