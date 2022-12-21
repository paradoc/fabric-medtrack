import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import Inspect from './Inspect'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'test-id',
  }),
}))

jest.mock('usehooks-ts', () => ({
  ...jest.requireActual('usehooks-ts'),
  useFetch: () => ({
    data: [
      {
        dispatch_id: 'test-dispatch-id',
        medications: [
          { generic_name: 'test-generic', brand_name: 'test_brand' },
        ],
      },
    ],
    error: null,
  }),
}))

describe('Inspect', () => {
  test('should match snapshot', () => {
    const { container, getByText } = render(<Inspect />)
    expect(container).toMatchSnapshot()
    fireEvent.click(getByText('Print'))
  })
})
