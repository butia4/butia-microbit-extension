import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { App } from "./App"
import store from "./redux/store"
import { BotSimContextProvider } from "./context/botsim.context"
import "./index.css"

const root = document.getElementById("root")!
createRoot(root).render(
    <StrictMode>
        <Provider store={store}>
            <BotSimContextProvider>
                <App />
            </BotSimContextProvider>
        </Provider>
    </StrictMode>
)
