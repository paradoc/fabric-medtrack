import { render, waitFor, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router'
import { setupFetchStub } from '../../../setupTests'
import Visualize from './Visualize'

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: () => ({
    search: new URLSearchParams({
      g: 'test-generic',
      s: '2022-12-01',
      e: '2022-12-02',
    }),
  }),
}))

describe('Visualize', () => {
  window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
    }))

  beforeEach(() => {
    const fakeData = [
      {
        current: 1,
        expected: 1,
        generic_name: 'test-generic',
        total_dispatches: 1,
      },
    ]
    global.fetch = jest.fn().mockImplementation(setupFetchStub(fakeData))
  })

  afterEach(() => {
    // global.fetch.mockClear()
    // delete global.fetch
  })

  test('should match snapshot', async () => {
    const { container } = render(
      <MemoryRouter>
        <Visualize />
      </MemoryRouter>
    )
    await waitFor(() => {
      screen.getByTestId('chart')
    })
    expect(container).toMatchSnapshot()
  })
})
