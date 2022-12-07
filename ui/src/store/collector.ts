import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit'
import { compose } from 'rambda'
import { produce } from 'immer' 
import { RootState } from '.'

export interface CollectorState {
  triggerSync: string | undefined
}

const initialState: CollectorState = {
  triggerSync: undefined
}

export const sync = createAsyncThunk<any, string>(
  'collector/sync',
  async (id: string, { rejectWithValue }) => {
    const pendingSync = JSON.parse(window.localStorage.getItem('pendingSync') ?? "{}")
    const response = await fetch(`http://localhost:8888/update`, {
      method: 'PUT',
      body: JSON.stringify({ id, timestamps: pendingSync[id] }),
      headers: {'content-type':'application/json'}
    })
    const cleanUp = compose(
      JSON.stringify,
      produce(data => { data[id] = [] })
    )(pendingSync)
    window.localStorage.setItem('pendingSync', cleanUp)
    if (response.status < 200 || response.status >= 300) {
      console.log('sync failed')
      return rejectWithValue(response.statusText)
    } else {
      console.log('sync ok')
    }
  }
)

export const collectorSlice = createSlice({
  name: 'collector',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(sync.pending, (state, action) => {
      state.triggerSync = action.meta.requestStatus
    }),
    builder.addCase(sync.fulfilled, (state, action) => {
      state.triggerSync = action.meta.requestStatus
    }),
    builder.addCase(sync.rejected, (state, action) => {
      state.triggerSync = action.meta.requestStatus
    })
  },
})

export const triggerSyncSelector = createSelector((state: RootState) => state.collector, selected => selected.triggerSync)
export default collectorSlice.reducer