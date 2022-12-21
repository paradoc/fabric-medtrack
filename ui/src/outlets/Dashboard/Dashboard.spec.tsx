import React from 'react'
import { MemoryRouter } from 'react-router'
import { act } from 'react-dom/test-utils'
import { render, waitFor } from '@testing-library/react'
import Dashboard from './Dashboard'

import { setupFetchStub } from '../../../setupTests'

describe('Dashboard', () => {
  beforeEach(() => {
    const fakeData = [
      {
        dispatch_id: 'test-dispatch-id',
        medications: [
          { generic_name: 'test-generic', brand_name: 'test_brand' },
        ],
      },
    ]
    global.fetch = jest.fn().mockImplementation(setupFetchStub(fakeData))
  })

  afterEach(() => {
    // global.fetch.mockClear()
    // delete global.fetch
    jest.clearAllTimers()
  })

  test('should match snapshot', async () => {
    jest.useFakeTimers()
    jest.runAllTimers()
    const { container, getByText } = render(
      <MemoryRouter initialEntries={['/']}>
        <Dashboard />
      </MemoryRouter>
    )
    await waitFor(
      () => {
        expect(getByText('test-dispatch-id')).toBeInTheDocument()
      },
      {
        timeout: 5000,
        interval: 2000,
      }
    )
    expect(container).toMatchSnapshot()
  })
})
