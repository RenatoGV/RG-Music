import { colors } from "@/constants/tokens"
import { useNavigation } from "expo-router"
import { useLayoutEffect, useState } from "react"
import { SearchBarProps } from "react-native-screens"

const defaultSearchOption: SearchBarProps = {
    tintColor: colors.primary,
    textColor: '#fff',
    hintTextColor: colors.placeholder,
    headerIconColor: colors.icon,
    hideWhenScrolling: false
}
export const useNavigationSearch = ({searchBarOptions}: {searchBarOptions?: SearchBarProps}) => {
    const [search, setSearch] = useState('')

    const navigation = useNavigation()

    const handleOnChangeText: SearchBarProps['onChangeText'] = ({nativeEvent: {text}}) => {
        setSearch(text)
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerSearchBarOptions: {
                ...defaultSearchOption,
                ...searchBarOptions,
                onChangeText: handleOnChangeText
            }
        })
    }, [navigation, searchBarOptions])

    return search
}