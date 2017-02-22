import getMuiTheme from 'material-ui/styles/getMuiTheme';
// import {
//   cyan500, cyan700,
//   pinkA200,
//   grey100, grey300, grey400, grey500,
//   white, darkBlack, fullBlack,
// } from '../colors';

import {
    orange400, orange500, orange600, orange700,
    darkBlack,
} from 'material-ui/styles/colors'

// const primaryColor = orange500
// const primaryColor = "#ffc86e"
// TODO: alternative accent color - 2016-08-08
// DEEP ORANGE
export const lightAccentColor = "#FF7043"
export const accentColor = "#FF5722"
export const darkAccentColor = "#F4511E"

// AMBER
// export const lightPrimaryColor = "#FFECB3"
// export const primaryColor = "#FFC107"
export const darkPrimaryColor = "#FFA000"
export const primaryColor = "#333"

export const lightSecondaryColor = "#FFECB3"
export const secondaryColor = "#FFC107"
export const darkSecondaryColor = "#FFA000"


// saved states
export const savedGreen = "#4CAF50"
export const savedRed = darkPrimaryColor

export const primaryTextColor = "#212121"
export const secondaryTextColor = "#757575"

export const lightTextColor = "white"

export const dividerColor = "#BDBDBD"

// export const textColor = "white"

export default () => (
    getMuiTheme({
        appBar: {
            height: 56,
        },
        palette: {
            primary1Color: accentColor,
            primary2Color: secondaryColor,
            primary3Color: secondaryColor,
            accent1Color: darkSecondaryColor,
            accent2Color: secondaryColor,
            accent3Color: secondaryColor,
            // textColor: primaryTextColor,
            // alternateTextColor: lightTextColor,
        }
    })
)
