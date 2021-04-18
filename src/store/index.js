import Vue from 'vue';
import Vuex from 'vuex';
import user from "@/store/modules/user";
import getters from '@/store/getters'
import app from "@/store/modules/app";
import settings from "@/store/modules/settngs";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    user,
    app,
    settings,
  },
  getters
})

export default store
