import Header from "../../../components/header/Header";
import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ProfileInfo from "../../../components/profile/ProfileInfo";
import ErrorMessage from "../../../components/messages/ErrorMessage";
import SuccessMessage from "../../../components/messages/SuccessMessage";
import { getUserByUsername } from "../../../services/user/user-service";
import { User } from "../../../services/user/dto/user-dto";
import { Account } from "../../../services/account/dto/account-dto";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../../../services/auth/token-service";
import { PrivacySettingsDTO } from "../../../services/account/dto/privacy-settings-dto";
// import { UserFriendsDTO } from "../../../services/friendship/dto/friendship-dto";
// import { getFriends } from "../../../services/friendship/friendship-service";

interface UserProfile {
  user: User;
  account: Account;
  privacy_settings: PrivacySettingsDTO[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const UserProfilePage = () => {
  const [isVertical, setIsVertical] = React.useState(window.innerWidth >= 886);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [userData, setUserData] = React.useState<UserProfile | null>(null);
  // const [friends, setFriends] = React.useState<UserFriendsDTO[]>([]);

  React.useEffect(() => {
    const handleResize = () => {
      setIsVertical(window.innerWidth >= 886);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const decodeTokenAndGetUsername = async () => {
    const token = await getToken();

    if (token) {
      const decodedToken: { username: string } = jwtDecode(token);
      return decodedToken.username;
    }
  };

  React.useEffect(() => {
    const success_message = localStorage.getItem("successMessage");
    const error_message = localStorage.getItem("errorMessage");

    if (success_message) {
      setSuccessMessage(success_message);
      localStorage.removeItem("successMessage");
    } else if (error_message) {
      setErrorMessage(error_message);
      localStorage.removeItem("errorMessage");
    }
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      const pathParts = window.location.pathname.split("/");
      const usernameWithAt = pathParts[pathParts.length - 1];
      const username = usernameWithAt.replace("@", "");

      const tokenUsername = await decodeTokenAndGetUsername();
      if (tokenUsername === username) {
        return window.location.replace("/user/my-profile");
      }

      getUserByUsername(username).then((response) => {
        if (response.success) {
          setUserData({
            user: response.user ?? {
              id: null,
              first_name: null,
              last_name: null,
              email: null,
              username: null,
              gender: null,
            },
            account: response.account ?? {
              id: null,
              bio: null,
              location: null,
              profile_picture: null,
              social_links: [],
            },
            privacy_settings: response.privacy_settings ?? null,
          });
        } else {
          setErrorMessage(
            response.response?.message ??
              response.response?.error ??
              response.message ??
              response.error ??
              "Something went wrong"
          );
        }
      });
    };

    fetchData();
  }, []);

  // React.useEffect(() => {
  //   const fetchFriends = async () => {
  //     const response = await getFriends();
  //     if (response.success) {
  //       setFriends(response.friends);
  //     }
  //   };

  //   fetchFriends();
  // }, []);

  return (
    <>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <Header />
      <div id="profile-container">
        <Box
          sx={{
            display: "flex",
            flexDirection: isVertical ? "row" : "column",
            height: "100%",
            paddingTop: "120px",
            paddingLeft: "0",
          }}
        >
          {/* Tab Menyu */}
          <Tabs
            orientation={isVertical ? "vertical" : "horizontal"}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="Profile tabs"
            sx={{
              borderRight: isVertical ? 1 : 0,
              borderBottom: isVertical ? 0 : 1,
              borderColor: "divider",
              minWidth: isVertical ? 250 : "100%",
              position: isVertical ? "fixed" : "relative",
              top: isVertical ? "140px" : "0",
              left: isVertical ? "0" : "auto",
              width: isVertical ? "250px" : "100%",
              height: isVertical ? "calc(100% - 140px)" : "auto",
              overflowY: "auto",
              zIndex: 10,
              bgcolor: "background.paper",
              paddingLeft: 0,
            }}
          >
            <Tab
              label={`${userData?.user?.username}'s Profile`}
              {...a11yProps(0)}
            />
          </Tabs>

          {/* Məzmun */}
          <Box
            sx={{
              marginLeft: isVertical ? "250px" : "0",
              flexGrow: 1,
              padding: 0,
              minWidth: 0,
              paddingLeft: 0,
            }}
          >
            <TabPanel value={0} index={0}>
              <ProfileInfo userData={userData} />
            </TabPanel>
          </Box>
        </Box>
      </div>
    </>
  );
};

export default UserProfilePage;
