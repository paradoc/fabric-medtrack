import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import produce from 'immer'
import ListItem from './ListItem'

const mockClick = jest.fn()

describe('ListItem', () => {
  test('should match the snapshot and confirm the click button behavior', () => {
    const props = {
      data: {
        brand_name: 'test-brand',
        generic_name: 'test-generic',
        frequency: '',
        end_after_n: 1,
      },
      onClick: mockClick,
      shouldReset: true,
    }

    const { rerender, container, getByTestId } = render(<ListItem {...props} />)
    rerender(
      <ListItem
        {...produce(props, (data) => {
          data.shouldReset = false
        })}
      />
    )
    fireEvent.click(getByTestId('checkbox'))
    expect(mockClick).toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })
})
