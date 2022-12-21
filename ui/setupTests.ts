import '@testing-library/jest-dom/extend-expect'


import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(isSameOrAfter)
dayjs.extend(duration)
dayjs.extend(relativeTime)


export function setupFetchStub(data: any) {
  return function fetchStub(_url: string) {
    return new Promise((resolve) => {
      resolve({
        json: () => Promise.resolve(data),
      })
    })
  }
}