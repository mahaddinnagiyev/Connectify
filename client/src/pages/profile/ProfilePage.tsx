import * as React from "react";
import { Helmet } from "react-helmet-async";
import Header from "../../components/header/Header";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ProfileInfo from "../../components/profile/ProfileInfo";
import FriendList from "../../components/friends/FriendList";
import BlockList from "../../components/profile/block-list/BlockList";
import ErrorMessage from "../../components/messages/ErrorMessage";
import SuccessMessage from "../../components/messages/SuccessMessage";
import FriendRequests from "../../components/friends/FriendRequests";
import { getUserById } from "../../services/user/user-service";
import { User } from "../../services/user/dto/user-dto";
import { Account } from "../../services/account/dto/account-dto";
import { PrivacySettingsDTO } from "../../services/account/dto/privacy-settings-dto";
import { getToken } from "../../services/auth/token-service";
import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js";

interface UserProfile {
  user: User;
  account: Account;
  privacy_settings: PrivacySettingsDTO;
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

const ProfilePage = () => {
  const [value, setValue] = React.useState<number>(() => {
    const savedTab = localStorage.getItem("activeTab");
    return savedTab ? parseInt(savedTab, 10) : 0;
  });
  const [isVertical, setIsVertical] = React.useState(window.innerWidth >= 886);
  const [userID, setUserID] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [userData, setUserData] = React.useState<UserProfile | null>(null);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsVertical(window.innerWidth >= 886);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    localStorage.setItem("activeTab", value.toString());
  }, [value]);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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
    const fetchTokenData = async () => {
      const token = await getToken();
      if (!token) return;

      const decodedToken: { id: string } = jwtDecode(token);
      setUserID(decodedToken.id);
    };

    const fetchData = async () => {
      try {
        setIsDataLoaded(true);
        fetchTokenData();

        const encryptionKey = process.env.VITE_CRYPTO_SECRET_KEY;

        const cacheKey = `connectify_profile`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const { userId, profile: encryptedProfile } = JSON.parse(cachedData);

          if (userId === userID) {
            const bytes = CryptoJS.AES.decrypt(
              encryptedProfile,
              encryptionKey!
            );
            const decryptedChats = await JSON.parse(
              bytes.toString(CryptoJS.enc.Utf8)
            );

            setUserData(decryptedChats);
            setIsDataLoaded(false);
          }
        }

        const response = await getUserById();
        if (response.success) {
          const profileData = {
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
              last_login: null,
            },
            privacy_settings: response.privacy_settings ?? null,
          };
          setUserData(profileData);

          const encryptedProfile = CryptoJS.AES.encrypt(
            JSON.stringify(profileData),
            encryptionKey!
          ).toString();

          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              userId: userID,
              profile: encryptedProfile,
            })
          );
        } else {
          setErrorMessage(
            response.response?.message ??
              response.response?.error ??
              response.message ??
              response.error ??
              "Something went wrong"
          );
        }
      } catch (error) {
        if (error) {
          setErrorMessage("Something went wrong - Please try again later");
        }
      } finally {
        setIsDataLoaded(false);
      }
    };

    fetchData();
  }, [userID]);

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

      <Helmet>
        <title>Connectify | My Profile</title>
      </Helmet>

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
          {/* Tab Menu */}
          <Tabs
            orientation={isVertical ? "vertical" : "horizontal"}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            value={value}
            onChange={handleChange}
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
            <Tab label="My Profile" {...a11yProps(0)} />
            <Tab label="Friend List" {...a11yProps(1)} />
            <Tab label="Friend Requests" {...a11yProps(2)} />
            <Tab label="Block List" {...a11yProps(3)} />
          </Tabs>

          {/* Content */}
          <Box
            sx={{
              marginLeft: isVertical ? "250px" : "0",
              flexGrow: 1,
              padding: 0,
              minWidth: 0,
              paddingLeft: 0,
            }}
          >
            <TabPanel value={value} index={0}>
              <ProfileInfo userData={userData} isDataLoaded={isDataLoaded} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <FriendList />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <FriendRequests />
            </TabPanel>
            <TabPanel value={value} index={3}>
              <BlockList />
            </TabPanel>
          </Box>
        </Box>
      </div>
    </>
  );
};

export default ProfilePage;
