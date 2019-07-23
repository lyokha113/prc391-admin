const getters = {
  // app
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,

  // permission
  permission_routes: state => state.permission.routes,

  // user
  token: state => state.user.token,
  id: state => state.user.id,
  email: state => state.user.email,
  fullName: state => state.user.fullName,
  address: state => state.user.address,
  phone: state => state.user.phone,
  roles: state => state.user.roles,

  // account
  accounts: state => state.account.accounts,

  // category
  categories: state => state.category.categories,

  // product
  products: state => state.product.products,

  // bidding
  biddings: state => state.bidding.biddings
};
export default getters;
