/* eslint-disable jsx-a11y/alt-text */
import { Box } from "@mui/material";
import ConnectMenu from "./ConnectMenu.jsx";
import styled from "styled-components";
import { Link } from "react-router-dom";

function TopBar({ setNotification }) {
  const menus = ["Staking", "FAQ"];

  return (
    <>
      <StyledContainer>
        <Box>
          <LogoSVG />
          <Menus>
            {menus.map((data, i) => {
              return (
                <Link key={i} to={`/${data.toLowerCase()}`}>
                  {data}
                </Link>
              );
            })}
            <ConnectMenu setNotification={setNotification} />
          </Menus>
        </Box>
      </StyledContainer>
    </>
  );
}

const Menus = styled(Box)`
  display: flex;
  align-items: center;
  > a {
    color: white;
    transition: all 0.3s;
    :hover {
      color: #2c64f7;
    }
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
  }
  width: 100%;
  max-width: 400px;
  justify-content: space-between;
  @media screen and (max-width: 500px) {
    max-width: 270px;
    > a {
      font-size: 15px;
    }
  }
`;

const LogoSVG = styled(Box)`
  background: url("/logotext.png");
  background-size: 100% 100%;
  width: 180px;
  height: 51px;
  @media screen and (max-width: 650px) {
    background: url("/logo.png");
    background-size: 100% 100%;
    width: 50px;
  }
`;

const StyledContainer = styled(Box)`
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  > div {
    display: flex;
    justify-content: space-between;
    max-width: 1800px;
    width: 100%;
    padding: 0 12px;
    align-items: center;
  }
  width: 100%;
  position: fixed;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: #262626;
  box-shadow: 0 0 5px rgb(0 0 0 / 11%);
  z-index: 1000;
`;

export default TopBar;
