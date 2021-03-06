<template>
  <div ref="container" class="container" :class="{ 'dev-visual-debugger': showCanvasDebugger }">
    <div ref="child" :class="{ 'dev-visual-debugger': showCanvasDebugger }">
      <!-- Any draggable content comes in here -->
      <slot></slot>
    </div>
  </div>
</template>

<script>
import Panzoom from "@/mixins/panzoom";
import { mapState } from "vuex";
import { ipcRenderer } from "electron";
import isElectron from "is-electron";
const isDev = require("electron-is-dev");

export default {
  data() {
    return {
      isDev: isDev,
      panzoomInstance: null
    };
  },
  computed: {
    ...mapState({
      showCanvasDebugger: state => state.dev.showCanvasDebugger
    })
  },
  mounted() {
    // Make it available to everyone!
    const parentEl = this.$refs.container;
    const childEl = parentEl.firstElementChild;
    this.$root.$panzoom = new Panzoom(childEl, parentEl, {});
    this.panzoomInstance = this.$root.$panzoom;

    // Enable event listeners
    this.$nextTick(() => {
      this.enableEventListeners();
    });
  },
  methods: {
    enableEventListeners() {
      // Listen for changes
      this.panzoomInstance
        .on("zoomStart", () => {
          this.$store.commit("interactions/interactionSetState", {
            key: "isZooming",
            value: true
          });
        })
        .on("panStart", () => {
          this.$store.commit("interactions/interactionSetState", {
            key: "isPanning",
            value: true
          });
        })
        .on("zoomStop", () => {
          this.$store.commit("interactions/interactionSetState", {
            key: "isZooming",
            value: false
          });
        })
        .on("panStop", () => {
          this.$store.commit("interactions/interactionSetState", {
            key: "isPanning",
            value: false
          });
        });

      // Listen for menu bar events
      // TODO Add tests for these
      if (isElectron()) {
        ipcRenderer.on("menu_zoom-to-fit", this.panzoomInstance.fitToScreen);
        ipcRenderer.on("menu_zoom-in", this.panzoomInstance.zoomIn);
        ipcRenderer.on("menu_zoom-out", this.panzoomInstance.zoomOut);
        ipcRenderer.on("menu_show-developer-canvas-debugger", () => {
          this.$store.commit("dev/toggleCanvasDebugger");
        });
      }
    },
    fitToScreen() {
      this.panzoomInstance.fitToScreen();
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  position: absolute;
  overflow: hidden;
  outline: none;
  height: 100%;
  width: 100%;
}

.dev-visual-debugger {
  &:before,
  &:after {
    position: absolute;
    height: 100%;
    width: 100%;
    content: "";
    z-index: 1;
    pointer-events: none;
  }

  // Vertical line
  &:before {
    left: 50%;
    border-left: 1px solid red;
  }

  // Horizonal line
  &:after {
    top: 50%;
    left: 0;
    border-top: 1px solid red;
  }

  // Nested debugger
  .dev-visual-debugger {
    // Vertical line
    &:before {
      left: 50%;
      border-left: 1px solid green;
    }

    // Horizonal line
    &:after {
      top: 50%;
      border-top: 1px solid green;
    }
  }
}
</style>