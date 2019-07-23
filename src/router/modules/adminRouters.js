/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const adminRouters = [
  {
    path: '/manage',
    component: Layout,
    redirect: 'noRedirect',
    alwaysShow: true,
    name: 'Management',
    meta: {
      title: 'Management',
      icon: 'table',
      roles: ['ADMINISTRATOR']
    },
    children: [
      {
        path: '/account',
        component: () => import('@/views/account/index'),
        name: 'Account',
        meta: {
          title: 'Account',
          roles: ['ADMINISTRATOR']
        }
      },
      {
        path: '/category',
        component: () => import('@/views/category/index'),
        name: 'Category',
        meta: {
          title: 'Category',
          roles: ['ADMINISTRATOR']
        }
      },
      {
        path: '/product',
        component: () => import('@/views/product/index'),
        name: 'Product',
        meta: {
          title: 'Product',
          roles: ['ADMINISTRATOR']
        }
      },
      {
        path: '/bidding',
        component: () => import('@/views/bidding/index'),
        name: 'Bidding',
        meta: {
          title: 'Bidding',
          roles: ['ADMINISTRATOR']
        }
      }
    ]
  },
  {
    path: '/payment',
    component: Layout,
    redirect: 'noRedirect',
    alwaysShow: true,
    name: 'Payment',
    meta: {
      title: 'Payment',
      icon: 'money',
      roles: ['ADMINISTRATOR']
    },
    children: [
      {
        path: '/list',
        component: () => import('@/views/dashboard/index'),
        name: 'PaymentList',
        meta: {
          title: 'Payment List',
          roles: ['ADMINISTRATOR']
        }
      }
    ]
  },
  {
    path: '/report',
    component: Layout,
    redirect: 'noRedirect',
    alwaysShow: true,
    name: 'Report',
    meta: {
      title: 'Chart Report',
      icon: 'chart',
      roles: ['ADMINISTRATOR']
    },
    children: [
      {
        path: '/',
        component: () => import('@/views/dashboard/index'),
        name: 'ProductManager',
        meta: {
          title: 'Report',
          roles: ['ADMINISTRATOR']
        }
      }
    ]
  }
]

export default adminRouters
