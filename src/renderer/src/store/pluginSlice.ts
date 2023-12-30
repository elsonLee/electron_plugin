import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const remote = require("@electron/remote");

export const pluginSlice = createSlice({
    name: 'plugins',
    initialState: {
        totalPlugins: [] as any[],
        localPlugins: remote.getGlobal('LOCAL_PLUGINS').getLocalPlugins() as any[],
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

        refreshInstalledPlugins(state: any) {
            const localPlugins = remote.getGlobal('LOCAL_PLUGINS').getLocalPlugins();
            console.log("refreshInstalledPlugins: ", localPlugins);
            return {
                ...state,
                localPlugins: localPlugins
            }
        }
    },
});

export const { refreshInstalledPlugins } = pluginSlice.actions;

// selectors 等其他代码可以使用导入的 `RootState` 类型
//export const selectCount = (state: RootState) => state.counter.value;

export default pluginSlice.reducer;