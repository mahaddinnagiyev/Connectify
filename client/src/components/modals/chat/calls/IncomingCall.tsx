import { useEffect, useState } from "react";
import { User } from "../../../../services/user/dto/user-dto";
import { getUserById } from "../../../../services/user/user-service";

interface IncomingCallProps {
  incomingCall: { from: string; visible: boolean };
  handleAcceptCall: () => void;
  handleDeclineCall: () => void;
}

const IncomingCall = ({
  incomingCall,
  handleAcceptCall,
  handleDeclineCall,
}: IncomingCallProps) => {
  const [caller, setCaller] = useState<User | null>(null);

  useEffect(() => {
    getUserById(incomingCall.from).then((response) => {
      if (response.success) {
        setCaller(response.user);
      }
    });
  }, [incomingCall.from]);

  return (
    <div className="animate-fade-in fixed top-4 right-4 z-[9999] min-w-[300px] overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm shadow-lg ring-1 ring-white/20 bg-[#0f0f0f]">
      <div className="flex flex-col p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80">Incoming Call</p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              {caller?.first_name} {caller?.last_name}
            </h3>
            <p className="text-sm text-white/60">@{caller?.username}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
        </div>

        <div className="mt-6 flex justify-between gap-3">
          <button
            onClick={handleDeclineCall}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500/20 px-4 py-3 transition-all duration-300 hover:bg-red-500/80 hover:scale-105"
          >
            <svg
              className="w-5 h-5 text-red-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="font-medium text-red-100">Decline</span>
          </button>

          <button
            onClick={handleAcceptCall}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-500/20 px-4 py-3 transition-all duration-300 hover:bg-green-500/80 hover:scale-105"
          >
            <svg
              className="w-5 h-5 text-green-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium text-green-100">Accept</span>
          </button>
        </div>
      </div>

      <div className="h-1 bg-white/20 animate-progress-bar" />
    </div>
  );
};

export default IncomingCall;
