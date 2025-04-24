import { Stack } from "expo-router";
import "/Users/erichuang/Documents/GitHub/ac final/cafehopper/cafe-hopper/app/globals.css" ; 
export default function RootLayour (){
    return <Stack > 
        <Stack.Screen
        name = "(tabs)"
        options ={ {headerShown: false}}
        />
        <Stack.Screen
        name = "cafe/[id]"
        options ={ {headerShown: false}}
        />
    </Stack>
}