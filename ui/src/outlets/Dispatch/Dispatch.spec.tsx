import React from 'react'
import { act } from 'react-dom/test-utils'
import { fireEvent, render } from '@testing-library/react'
import { setupFetchStub } from '../../../setupTests'
import Dispatch from './Dispatch'

describe('Dispatch', () => {
  beforeEach(() => {
    const fakeData = {
      dispatch_id: 'test-dispatch-id',
    }
    global.fetch = jest.fn().mockImplementation(setupFetchStub(fakeData))
  })

  afterEach(() => {
    // global.fetch.mockClear()
    // delete global.fetch
  })

  test('should match snapshot', () => {
    const { container } = render(<Dispatch />)
    act(() => {
      expect(container).toMatchSnapshot()
    })
  })

  test('should check click behavior', async () => {
    const { container, getByTestId } = render(<Dispatch />)
    const submit = getByTestId('submit')
    const brand = getByTestId('brand')
    const frequency = getByTestId('frequency')
    const generic = getByTestId('generic')
    const count = getByTestId('count')
    act(() => {
      fireEvent.change(brand, { target: { value: 'test-brand' } })
      fireEvent.change(generic, { target: { value: 'test-generic' } })
      fireEvent.change(frequency, { target: { value: 2 } })
      fireEvent.change(count, { target: { value: 1 } })
      fireEvent.click(submit)
    })
    expect(container).toMatchSnapshot()
  })
})
