import { combineReducers } from "redux";
import * as actions from "./actions";

const initSongState = {};
const songReducer = (state = initSongState, action) => {
  switch (action.type) {
    case actions.ADD_SONG:
      return state;

    default:
      return state;
  }
};

const reducer = combineReducers({
  songs: songReducer,
});

export default reducer;
