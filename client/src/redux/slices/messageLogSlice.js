import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  areaOfInterest: "",
  date: "",
  mobileNo: "",
  modeOfCommunication: "",
  name: "",
  stream: "",
};

const messageLogSlice = createSlice({
  name: "messageLog",
  initialState,
  reducers: {
    setMessageLog(state, action) {
      return { ...state, ...action.payload };
    },
    getMessageLog(state) {
      return state;
    },
  },
});

export const { setMessageLog, getMessageLog } = messageLogSlice.actions;

export default messageLogSlice.reducer;
