import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login']

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          if (store.getters.token) {
            await store.dispatch('user/getInfo')
            const accessRoutes = await store.dispatch(
              'permission/generateRoutes',
              store.getters.roles
            )
            router.addRoutes(accessRoutes)
            next({ ...to, replace: true })
          } else {
            await store.dispatch('user/logout')
            next(`/login`)
          }
        } catch (error) {
          await store.dispatch('user/logout')
          Message.error(error || 'Has Error')
          next(`/login`)
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
