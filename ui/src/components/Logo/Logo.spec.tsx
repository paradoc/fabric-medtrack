import React from 'react'
import { render } from '@testing-library/react'
import Logo from './Logo'

describe('Logo', () => {
  test('should match snapshot', () => {
    const { container } = render(<Logo />)
    expect(container).toMatchSnapshot()
  })
})
