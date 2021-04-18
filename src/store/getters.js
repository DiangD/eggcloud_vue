const getters = {
  avatar: state => state.user.avatar,
  userId: state => state.user.userId,
  token: state => state.user.token,
  userDetail: state => state.user.userDetail,
  username: state => state.user.username,
  nickname: state => state.user.nickname,
  menuList: state => state.user.menuList,

  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
}
export default getters
