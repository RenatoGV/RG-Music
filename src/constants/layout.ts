import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { colors } from "./tokens";

export const StackScreenWithSearchBar: NativeStackNavigationOptions = {
    headerLargeTitle: true,
    headerLargeStyle: {
        backgroundColor: colors.background
    },
    headerLargeTitleStyle: {
        color: colors.text
    },
    headerTintColor: colors.text,
    headerTransparent: false,
    // headerBackground: () => <Text>asd</Text>, // TODO: Transparencia
    headerStyle: {
        backgroundColor: colors.background
    },
    headerBlurEffect: 'prominent',
    headerShadowVisible: false
}