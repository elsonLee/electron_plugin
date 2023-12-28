import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export const pluginSlice = createSlice({
    name: 'plugins',
    //initialState,
    initialState: {
        totalPlugins: [] as any[],
        localPlugins: [] as any[],
        searchValue: '',
        active: ['finder'],
    },
    reducers: {
        commonUpdate(state: any, payload) {
            Object.keys(payload).forEach((key) => {
                state[key] = payload[key];
            });
        },
        setSearchValue(state: any, payload) {
            state.searchValue = payload;
        },

        initPlugins(state: any, commit) {
            const remote = require("@electron/remote");
            const localPlugins = remote.getGlobal('LOCAL_PLUGINS').getLocalPlugins();
            return {
                ...state,
                localPlugins: localPlugins
            }
        }
    },
});

// 为每个 case reducer 函数生成 Action creators
export const { initPlugins } = pluginSlice.actions;

// selectors 等其他代码可以使用导入的 `RootState` 类型
//export const selectCount = (state: RootState) => state.counter.value;

export default pluginSlice.reducer;