import { createSlice } from "@reduxjs/toolkit";

class ConfigDB {
  static data = {
    settings: {
      layout_type: 'ltr',
      layout_class: 'compact-wrapper',
      sidebar: {
        iconType: 'stroke',
      },
      sidebar_setting: 'default-sidebar',
    },
    color: {
      primary_color:'#7A70BA',
      secondary_color: '#48A3D7',
      mix_background_layout: 'dark-sidebar',
    }
  };
}

const default_color = ConfigDB.data.color.primary_color;
const secondary_color = ConfigDB.data.color.secondary_color;
const mix_layout = ConfigDB.data.color.mix_background_layout
const initialState = {
  layout:ConfigDB.data.settings.layout_class,
  openCus: false,
  sidebarIconType: "stroke",
  colorBackground1: default_color,
  colorBackground2: secondary_color,
  mix_background_layout: mix_layout,
};

const ThemeCustomizerSlice = createSlice({
  name: "ThemeCustomizer",
  initialState,
  reducers: {
    setLayout:(state,action)=>{
      state.layout = action.payload;
    },
    setOpenCus: (state, action) => {
      state.openCus = action.payload;
    },
    setColorBackground1: (state, action) => {
      state.colorBackground1 = action.payload;
    },
    setColorBackground2: (state, action) => {
      state.colorBackground2 = action.payload;
    },
    addSidebarIconType: (state, action) => {
      ConfigDB.data.settings.sidebar.iconType = action.payload;
      state.sidebarIconType = action.payload;
      state.openCus = false;
    },
    setMixBackgroundLayout: (state, action) => {
      state.mix_background_layout = action.payload;
    },
  },
});

export const {setMixBackgroundLayout, setColorBackground2, setColorBackground1, setOpenCus, addSidebarIconType,setLayout } = ThemeCustomizerSlice.actions;

export default ThemeCustomizerSlice.reducer;