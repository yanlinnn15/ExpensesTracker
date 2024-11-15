import { Box, Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorImg from 'src/assets/images/backgrounds/404-error-idea.gif';
import { useLocation } from 'react-router-dom';

function Error() {
  const location = useLocation();
  const errormsg = location.state?.errormsg;

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      textAlign="center"
      justifyContent="center"
    >
      <Container maxWidth="md">
        <img src={ErrorImg} alt="404" style={{ width: '100%', maxWidth: '500px' }} />
        <Typography align="center" variant="h1" mb={4}>
          Oops!!!
        </Typography>
        {errormsg || !localStorage.getItem('accessToken') ? (
          <>
            <Typography align="center" variant="h4" mb={4}>
              {errormsg}
            </Typography>
            <Button color="primary" variant="contained" component={Link} to="/auth/login" disableElevation>
              Go Back to Login
            </Button>
          </>
        ) : (
          <>
            <Typography align="center" variant="h4" mb={4}>
              The page you are looking for could not be found.
            </Typography>
            <Button color="primary" variant="contained" component={Link} to="/" disableElevation>
              Go Back to Home
            </Button>
          </>
        )}
      </Container>
    </Box>
  );
}

export default Error;
