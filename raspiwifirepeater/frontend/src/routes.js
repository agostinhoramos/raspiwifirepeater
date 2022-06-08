import { BrowserRouter, Routes, Route } from "react-router-dom";

import LayoutIndex from "./components/Layout";

import Overview from "./pages/overview";
import Wifi from "./pages/wifi";
import Settings from "./pages/settings";

const MyRoutes = () => {
    return(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<LayoutIndex />} >
                <Route path="/" element={<Overview />} />
                <Route path="/wifi" element={<Wifi />} />
                <Route path="/settings" element={<Settings />} />
            </Route>
        </Routes>
    </BrowserRouter>
    )
}

export default MyRoutes;