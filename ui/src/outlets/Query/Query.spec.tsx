import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import Query from './Query'
import { MemoryRouter } from 'react-router'

describe('Query', () => {
  test('should match snapshot', () => {
    const { container } = render(<Query />)
    expect(container).toMatchSnapshot()
  })

  test('should check behaviors', async () => {
    const { container, getByTestId } = render(
      <MemoryRouter>
        <Query />
      </MemoryRouter>
    )
    const submit = getByTestId('submit')
    const generic = getByTestId('generic')
    const start = getByTestId('start')
    const end = getByTestId('end')
    act(() => {
      fireEvent.change(generic, { target: { value: 'test-generic' } })
      fireEvent.change(start, { target: { value: '2022-12-01' } })
      fireEvent.change(end, { target: { value: '2022-12-02' } })
      fireEvent.click(submit)
    })
    expect(container).toMatchSnapshot()
  })
})
