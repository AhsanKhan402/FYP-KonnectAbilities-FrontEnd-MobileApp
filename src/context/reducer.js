export const initState = {
  isLogin: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_LOGIN":
      return {
        ...state,
        isLogin: action.isLogin,
      };
    default:
      return state;
  }
};

export default reducer;
