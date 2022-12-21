import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import Login from './Login'
import { act } from 'react-dom/test-utils'
import { MemoryRouter, Route, Routes } from 'react-router'

describe('Login', () => {
  test('should match snapshot', () => {
    const { container } = render(<Login />)
    expect(container).toMatchSnapshot()
  })

  test('should check behavior', async () => {
    const { container, getByTestId } = render(<Login />)
    const user = getByTestId('user')
    const pass = getByTestId('pass')
    const submit = getByTestId('submit')

    act(() => {
      fireEvent.change(user, { target: { value: 'test' } })
      fireEvent.change(pass, { target: { value: 'pass' } })
    })
    expect(submit).toBeEnabled()
    fireEvent.click(submit)
    expect(container).toMatchSnapshot()
  })

  test('should check behavior: ok', async () => {
    const { container, getByTestId } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route index element={<Login />} />
          <Route path="/dispatcher" element={<>dispatcher</>} />
        </Routes>
      </MemoryRouter>
    )
    const user = getByTestId('user')
    const pass = getByTestId('pass')
    const submit = getByTestId('submit')

    act(() => {
      fireEvent.change(user, { target: { value: 'medtrac' } })
      fireEvent.change(pass, { target: { value: 'password' } })
    })
    expect(submit).toBeEnabled()
    fireEvent.click(submit)
    expect(container).toMatchSnapshot()
  })
})
