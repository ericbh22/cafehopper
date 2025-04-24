import { Stack } from "expo-router";
import "../globals.css" ; 
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