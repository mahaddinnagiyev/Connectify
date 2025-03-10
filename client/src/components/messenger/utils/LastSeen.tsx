import { useEffect, useState } from "react";
import { Account } from "../../../services/account/dto/account-dto";
import {
  PrivacySettings,
  PrivacySettingsDTO,
} from "../../../services/account/dto/privacy-settings-dto";
import { getAllFriendshipRequests } from "../../../services/friendship/friendship-service";
import { FriendshipStatus } from "../../../services/friendship/enum/friendship-status.enum";

interface LastSeenProps {
  otherUserAccount: Account;
  otherUserPrivacySettings: PrivacySettingsDTO;
  otherUserId: string;
}

export const LastSeen = ({
  otherUserAccount,
  otherUserPrivacySettings,
  otherUserId,
}: LastSeenProps) => {
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (otherUserPrivacySettings.last_login === PrivacySettings.my_friends) {
      getAllFriendshipRequests()
        .then((response) => {
          if (response.success) {
            const acceptedFriend = response.friends.find(
              (friend) =>
                (friend.friend_id === otherUserId ||
                  friend.id === otherUserId) &&
                friend.status === FriendshipStatus.accepted
            );
            setIsFriend(!!acceptedFriend);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [otherUserAccount, otherUserId, otherUserPrivacySettings.last_login]);

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
          ? new Date(otherUserAccount.last_login).toLocaleTimeString("az-AZ", {
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
