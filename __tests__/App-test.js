/**
 * @flow
 */

import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';
import { renderHook, act } from '@testing-library/react-hooks'
import { useStore } from 'TTB/src/model/root'

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage)


it('fails without a store provider', () => {
  const { result } = renderHook(() => useStore())
  expect(result.error).toEqual(undefined)
})
