import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 10000,
        }}
      />

      <Outlet />
    </>
  );
}