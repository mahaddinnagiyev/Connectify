import Header from "../../components/header/Header";
import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ErrorMessage from "../../components/messages/ErrorMessage";
import SuccessMessage from "../../components/messages/SuccessMessage";
import { getUserById } from "../../services/user/user-service";
import { User } from "../../services/user/dto/user-dto";
import { Account } from "../../services/account/dto/account-dto";
import AccountSettings from "../../components/settings/AccountSettings";

interface UserProfile {
  user: User;
  account: Account;
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

const SettingsPage = () => {
  const [value, setValue] = React.useState<number>(() => {
    const savedTab = localStorage.getItem("activeTab");
    return savedTab ? parseInt(savedTab, 10) : 0;
  });
  const [isVertical, setIsVertical] = React.useState(window.innerWidth >= 886);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [userData, setUserData] = React.useState<UserProfile | null>(null);

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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
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
    getUserById().then((response) => {
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
            privacy_settings: null,
            social_links: [],
          },
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
  }, []);

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
            <Tab label="Account Settings" {...a11yProps(0)} />
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
              <AccountSettings userData={userData} />
            </TabPanel>
          </Box>
        </Box>
      </div>
    </>
  );
};

export default SettingsPage;
