import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // 当前菜单
    currentMenu: "PartSdyw",
    activeMenu: "PartSdyw"
  },
  mutations: {
    setCurrentMenu(state, menu) {
      state.currentMenu = menu,
        state.activeMenu = menu
    }
  },
  actions: {},
  modules: {}
});