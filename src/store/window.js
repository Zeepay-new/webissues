/**************************************************************************
* This file is part of the WebIssues Server program
* Copyright (C) 2006 Michał Męciński
* Copyright (C) 2007-2017 WebIssues Team
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
**************************************************************************/

import { ErrorCode } from '@/constants'

export default function makeWindowModule( router ) {
  return {
    namespaced: true,
    state: makeState(),
    getters: makeGetters(),
    mutations: makeMutations(),
    actions: makeActions( router )
  };
}

function makeState() {
  return {
    route: null,
    childComponent: null,
    childProps: null,
    size: 'small',
    busy: true,
    lastPromise: null
  };
}

function makeGetters() {
  return {
    error( state ) {
      if ( state.route != null && state.route.name == 'error' )
        return state.route.error;
      else
        return null;
    }
  };
}

function makeMutations() {
  return {
    clear( state ) {
      state.route = null;
      state.childComponent = null;
      state.childProps = null;
      state.size = 'small';
      state.busy = true;
      state.lastPromise = null;
    },
    setBusy( state, value ) {
      state.busy = value;
    },
    setRoute( state, value ) {
      state.route = value;
    },
    setComponent( state, { component, props, size } ) {
      state.childComponent = component;
      state.childProps = props;
      state.size = size;
    },
    setLastPromise( state, value ) {
      state.lastPromise = value;
    },
  };
}

function makeActions( router ) {
  return {
    handleRoute( { state, commit, dispatch }, route ) {
      commit( 'setRoute', route );
      if ( route.name != 'error' ) {
        const promise = route.handler( route.params );
        commit( 'setLastPromise', promise );
        promise.then( ( { component, size = 'normal', replace, ...props } ) => {
          if ( promise == state.lastPromise ) {
            if ( replace != null ) {
              router.replace( replace, props );
            } else {
              commit( 'setComponent', { component, props, size } );
              commit( 'setBusy', false );
            }
            commit( 'setLastPromise', null );
          }
        } ).catch( error => {
          if ( promise == state.lastPromise ) {
            dispatch( 'showError', error, { root: true } );
            commit( 'setLastPromise', null );
          }
        } );
      } else {
        commit( 'setComponent', { component: 'ErrorMessage', props: { error: route.error }, size: 'small' } );
        commit( 'setBusy', false );
      }
    },

    close( { getters, rootGetters, dispatch } ) {
      if ( getters.error != null ) {
        if ( rootGetters[ 'global/isAuthenticated' ] && getters.error.errorCode == ErrorCode.LoginRequired )
          dispatch( 'redirect', '/index.php', { root: true } );
        else
          dispatch( 'redirect', '/client/index.php', { root: true } );
      } else {
        dispatch( 'pushMainRoute', null, { root: true } );
      }
    }
  };
}
