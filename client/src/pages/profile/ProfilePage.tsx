import Header from "../../components/header/Header";
import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import "./style.css";
import ProfileInfo from "../../components/profile/ProfileInfo";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const ProfilePage = () => {
  const [value, setValue] = React.useState(0);
  const [gender, setGender] = React.useState("");

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Header />
      <div id="profile-container">
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: "background.paper",
            display: "flex",
            height: "100%",
            paddingTop: "140px",
          }}
        >
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            sx={{
              borderRight: 1,
              borderColor: "divider",
              minWidth: 300,
              position: "fixed",
              top: "140px",
              left: 0,
              height: "calc(100vh - 140px)",
              overflowY: "auto",
            }}
          >
            <Tab label="My Profile" {...a11yProps(0)} />
            <Tab label="Friend List" {...a11yProps(1)} />
            <Tab label="Friend Requests" {...a11yProps(2)} />
            <Tab label="Block List" {...a11yProps(3)} />
          </Tabs>
          <Box sx={{ marginLeft: "320px", flexGrow: 1 }}>
            {" "}
            {/* Left margin for tab positioning */}
            <TabPanel value={value} index={0}>
              <ProfileInfo gender={gender} setGender={setGender} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Typography variant="h4" gutterBottom>
                Settings
              </Typography>
              <Typography>Settings content goes here...</Typography>
            </TabPanel>
            <TabPanel value={value} index={2}>
              <Typography variant="h4" gutterBottom>
                Privacy
              </Typography>
              <Typography>Privacy content goes here...</Typography>
            </TabPanel>
          </Box>
        </Box>
      </div>
    </>
  );
};

export default ProfilePage;
