import { createStore } from 'vuex'
import auth from './modules/auth'
import task from './modules/task'
import reward from './modules/reward'
import point from './modules/point'

export default createStore({
  modules: {
    auth,
    task,
    reward,
    point
  }
})