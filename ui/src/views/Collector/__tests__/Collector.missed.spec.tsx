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
    data: [
      {
        dispatch_id: 'test-rx',
        medications: [
          { generic_name: 'test-generic', brand_name: 'test_brand' },
        ],
        history: {
          timestamps: [],
        },
      },
    ],
    error: null,
  }),
  useLocalStorage: (key: string) => {
    if (key === 'offlineData')
      return [
        {
          ['test-rx']: {
            medications: [
              {
                generic_name: 'test-generic',
                brand_name: 'test_brand',
                end_after_n: 1,
              },
            ],
            history: {
              timestamps: ['2022-01-01'],
              started_at: '',
              ended_at: '',
            },
          },
        },
        () => {},
      ]
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
