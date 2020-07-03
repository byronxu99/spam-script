import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";
import Papa from "papaparse";

// CSV data after parsing
export type ParsedData = {
  headers: string[];
  rows: string[][];
};

// what goes into the redux store
interface DataState {
  raw?: string;
  headers?: string[];
  rows?: string[][];
}
const initialState: DataState = {};

// slice creation
export const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setRawData: (state: DataState, action: PayloadAction<string>) => {
      state.raw = action.payload;
    },
    setParsedData: (state: DataState, action: PayloadAction<ParsedData>) => {
      state.headers = action.payload.headers;
      state.rows = action.payload.rows;
    },
  },
});

const { setRawData, setParsedData } = dataSlice.actions;
export default dataSlice.reducer;

// exported actions
export function loadData(input: string): AppThunk {
  return (dispatch) => {
    dispatch(setRawData(input));

    // parse the data
    const result = Papa.parse(input, {
      skipEmptyLines: "greedy",
    });
    const parsedData = trimData({
      headers: result.data[0] || [],
      rows: result.data.slice(1),
    } as ParsedData);

    dispatch(setParsedData(parsedData));
  };
}

// selectors
export function selectRawData(state: RootState): string {
  return state.data.raw || "";
}

export function selectParsedData(state: RootState): ParsedData {
  return {
    headers: state.data.headers || [],
    rows: state.data.rows || [],
  };
}

// trim whitespace from data
function trimData(data: ParsedData): ParsedData {
  return {
    headers: data.headers.map((x) => x.trim()),
    rows: data.rows.map((row) => row.map((x) => x.trim())),
  };
}
