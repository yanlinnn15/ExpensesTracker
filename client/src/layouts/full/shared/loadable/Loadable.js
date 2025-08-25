import React, { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";

const LoadingComponent = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="200px"
    width="100%"
  >
    <CircularProgress />
  </Box>
);

const Loadable = (Component) => (props) => (
  <Suspense fallback={<LoadingComponent />}>
    <Component {...props} />
  </Suspense>
);

export default Loadable;
