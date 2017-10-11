import * as types from 'actions/ActionTypes';
import update from 'react-addons-update';

const initialState = {
    status: 'INIT',
    isLoggedIn: false,
    currentUser: ''
};

export default function login(state, action) {
  if(typeof state === 'undefined')
    state = initialState;

    switch(action.type) {
          case types.AUTH_LOGIN:
              return update(state, {
                      status: { $set: 'WAITING' }
              });
          case types.AUTH_LOGIN_SUCCESS:
              return update(state, {
                      status: { $set: 'SUCCESS' },
                      isLoggedIn: { $set: true },
                      currentUser: { $set: action.email }
              });
          case types.AUTH_LOGIN_FAILURE:
              return update(state, {
                      status: { $set: 'FAILURE' }
              });
          default:
              return state;
      }
}
