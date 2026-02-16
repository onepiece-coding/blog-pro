// import { PersistGate } from "redux-persist/integration/react";
import { createRoot } from "react-dom/client";
import {
  // persistor,
  store,
} from "./store";
import { Provider } from "react-redux";

import AppRouter from "./routes/app-router.component";

import "bootstrap/dist/css/bootstrap.min.css";
import "./main.css";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    {/* <PersistGate persistor={persistor}> */}
    <AppRouter />
    {/* </PersistGate> */}
  </Provider>,
);
