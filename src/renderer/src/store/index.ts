import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import pluginReducer from "./pluginSlice";

const store = configureStore({
    reducer: {
        counter: counterReducer,
        plugins: pluginReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>

export default store;