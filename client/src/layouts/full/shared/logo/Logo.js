import { Link } from "react-router-dom";
import LogoDark1 from "src/assets/images/logos/dark1-logo.svg";
import { styled } from "@mui/material";

const LinkStyled = styled(Link)(() => ({
  height: "70px",
  width: "180px",
  overflow: "hidden",
  display: "block",
}));

const Logo = () => {
  return (
    <LinkStyled
      to="/"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={LogoDark1}
        alt="logo"
        style={{
          maxWidth: "100%",
          height: "auto",
          maxHeight: "60px",
        }}
      />
    </LinkStyled>
  );
};

export default Logo;
