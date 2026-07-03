import { Route, Routes } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Catalog } from "@/pages/Catalog";
import { PlantDetail } from "@/pages/PlantDetail";
import { MyPlants } from "@/pages/MyPlants";
import { MyPlantDetail } from "@/pages/MyPlantDetail";
import { Favorites } from "@/pages/Favorites";
import { ExchangeBoard } from "@/pages/ExchangeBoard";
import { ExchangeDetail } from "@/pages/ExchangeDetail";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="catalog/:id" element={<PlantDetail />} />
        <Route path="my-plants" element={<MyPlants />} />
        <Route path="my-plants/:id" element={<MyPlantDetail />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="exchange" element={<ExchangeBoard />} />
        <Route path="exchange/:id" element={<ExchangeDetail />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
