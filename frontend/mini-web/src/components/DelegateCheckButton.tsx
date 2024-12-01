import { useValidateStaking } from "@/lib/hooks/useValidateStaking";

export const DelegateCheckButton = () => {
  const { isDRepDelegated, isStaked, delegateToSidan } = useValidateStaking();

  const onClick = () => {
    if (isStaked && isDRepDelegated) {
      console.log("already delegated, verify discord");
    } else {
      delegateToSidan();
    }

    console.log("clicked");
  };

  return (
    <button
      onClick={onClick}
      className="btn z-10 h-full whitespace-nowrap bg-gray-800 rounded-xl border border-white transition px-8 py-4 hover:scale-105"
    >
      {isStaked && isDRepDelegated ? "Verify Discord" : "Delegate to Sidan"}
    </button>
  );
};
