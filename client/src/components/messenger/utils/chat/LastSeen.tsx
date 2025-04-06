import { Account } from "../../../../services/account/dto/account-dto";
import {
  PrivacySettings,
  PrivacySettingsDTO,
} from "../../../../services/account/dto/privacy-settings-dto";

interface LastSeenProps {
  otherUserAccount: Account;
  otherUserPrivacySettings: PrivacySettingsDTO;
  isFriend: boolean;
  loading: boolean;
}

export const LastSeen = ({
  otherUserAccount,
  otherUserPrivacySettings,
  isFriend,
  loading
}: LastSeenProps) => {

  if (otherUserPrivacySettings.last_login === PrivacySettings.everyone) {
    return (
      <p className="text-xs">
        Last seen at:{" "}
        {otherUserAccount?.last_login
          ? new Date(otherUserAccount.last_login + "Z").toLocaleTimeString("az-AZ", {
              timeZone: "Asia/Baku",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A"}
      </p>
    );
  }

  if (otherUserPrivacySettings.last_login === PrivacySettings.my_friends) {
    if (loading) {
      return <p className="text-xs">Loading last seen...</p>;
    }
    return isFriend ? (
      <p className="text-xs">
        Last seen at:{" "}
        {otherUserAccount?.last_login
          ? new Date(otherUserAccount.last_login + "Z").toLocaleTimeString("az-AZ", {
              timeZone: "Asia/Baku",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A"}
      </p>
    ) : (
      <p className="text-xs">Last seen at: N/A</p>
    );
  }

  if (otherUserPrivacySettings.last_login === PrivacySettings.nobody) {
    return null;
  }

  return <p className="text-xs">Last seen at: N/A</p>;
};
