import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'

import Collector from '../Collector'

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: () => ({
    search: new URLSearchParams({
      rx: 'test-rx',
    }),
  }),
}))

jest.mock('usehooks-ts', () => ({
  ...jest.requireActual('usehooks-ts'),
  useFetch: () => ({
    data: undefined,
    error: {
      message: 'NetworkError',
    },
  }),
  useLocalStorage: (key: string) => {
    if (key === 'offlineData') return [{}, () => {}]
    return [
      {
        ['test-rx']: [],
      },
      () => {},
    ]
  },
}))

describe('Collector', () => {
  test('should match snapshot', () => {
    const { container } = render(<Collector />)
    expect(container).toMatchSnapshot()
  })
})
