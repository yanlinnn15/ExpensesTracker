import { Suspense } from "react";
import { CircularProgress } from "@mui/material";

const Loadable = (Component) => (props) => (
  <Suspense
    fallback={
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    }
  >
    <Component {...props} />
  </Suspense>
);

export default Loadable;