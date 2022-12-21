import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Dispatcher from './Dispatcher'
import { MemoryRouter } from 'react-router'

jest.mock('usehooks-ts', () => ({
  ...jest.requireActual('usehooks-ts'),
  useSessionStorage: () => [true, () => {}],
}))

describe('Dispatcher', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2022-12-01'))
  })
  afterAll(() => {
    jest.clearAllTimers()
  })
  test('should match snapshot', () => {
    const { container, getByTestId } = render(
      <MemoryRouter>
        <Dispatcher />
      </MemoryRouter>
    )
    expect(container).toMatchSnapshot()
    const logoutButton = getByTestId('logout')
    fireEvent.click(logoutButton)
  })
})
