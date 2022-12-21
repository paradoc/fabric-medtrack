import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router'
import Watcher from './Watcher'

describe('Watcher', () => {
  test('should match snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <Watcher />
      </MemoryRouter>
    )
    expect(container).toMatchSnapshot()
  })
})
