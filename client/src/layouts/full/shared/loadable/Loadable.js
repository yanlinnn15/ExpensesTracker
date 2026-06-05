import React, { Suspense } from "react";
import { CircularProgress } from "@mui/material";

const Loadable = (Component) => (props) => (
  <Suspense fallback={<CircularProgress />}>
    <Component {...props} />
  </Suspense>
);

export default Loadable;
