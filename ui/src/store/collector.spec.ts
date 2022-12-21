import collectorReducer, { initialState, sync } from './collector'

describe('collector', () => {
  test('should set status to pending', async () => {
    const action = { type: sync.pending.type, meta: { requestStatus: sync.pending } }
    const state = collectorReducer(initialState, action)
    expect(state).toEqual({
      ...initialState,
      triggerSync: sync.pending
    })
  });

  test('should set status to fulfilled', async () => {
    const action = { type: sync.fulfilled.type, meta: { requestStatus: sync.fulfilled } }
    const state = collectorReducer(initialState, action)
    expect(state).toEqual({
      ...initialState,
      triggerSync: sync.fulfilled
    })
  });

  test('should set status to rejected', async () => {
    const action = { type: sync.rejected.type, meta: { requestStatus: sync.rejected } }
    const state = collectorReducer(initialState, action)
    expect(state).toEqual({
      ...initialState,
      triggerSync: sync.rejected
    })
  });
});