import { LOGIN_ATTEMPT, LOGIN_SUCCESS, LOGIN_FAILED } from '../actions/types';
const INITIAL_STATE = { user: null, loading: false, error: '' }
export default (state = INITIAL_STATE, action) => {
    let nextState;
    switch (action.type) {
        case LOGIN_ATTEMPT:
            return { ...state, loading: true }
        case LOGIN_FAILED:
            return { ...INITIAL_STATE, loading: false, error: action.error }
        case LOGIN_SUCCESS:
            return { ...INITIAL_STATE, loading: false, token: action.token, server_name: action.serv }

        default:
            return state;
    }
}