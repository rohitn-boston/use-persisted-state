import { useState, useEffect, useRef, useCallback } from 'react';
import useEventListener from '@use-it/event-listener';

import createGlobalState from './createGlobalState';

const usePersistedState = (initialState, key, { get, set }) => {
  const globalState = useRef(null);
  const [state, setState] = useState(() => get(key, initialState));

  // Subscribe to `storage` change events
  useEventListener('storage', ({ key: k, newValue }) => {
    if (k === key) {
      try {
        const newState = JSON.parse(newValue);
        if (state !== newState) {
          setState(newState);
        }
      } catch (error) {
        console.error(`Error parsing JSON for key "${key}":`, error);
        // If parsing fails, set state to the raw `newValue`
        if (state !== newValue) {
          setState(newValue);
        }
      }
    }
  });

  // Only called on mount
  useEffect(() => {
    // Register a listener that calls `setState` when another instance emits
    globalState.current = createGlobalState(key, setState, initialState);

    return () => {
      globalState.current.deregister();
    };
  }, [initialState, key]);

  const persistentSetState = useCallback(
    (newState) => {
      const newStateValue =
        typeof newState === 'function' ? newState(state) : newState;

      // Persist to localStorage
      set(key, newStateValue);

      setState(newStateValue);

      // Inform all of the other instances in this tab
      globalState.current.emit(newState);
    },
    [state, set, key]
  );

  return [state, persistentSetState];
};

export default usePersistedState;
