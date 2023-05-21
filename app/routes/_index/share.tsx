import {
  FormattedTimeAndPlace,
  capitalize,
  formattedTimeAndPlace,
} from "~/utils";
import type { Share } from "~/schema/share.server";

type YouHaveBeenInvitedMessageProps = Omit<Share, "relativeDate">;
export function YouHaveBeenInvitedMessage(
  props: YouHaveBeenInvitedMessageProps
) {
  return (
    <>
      🎉 Du har blitt invitert med i badstuen{" "}
      <FormattedTimeAndPlace {...props} />. Bli med da vell 🧖
    </>
  );
}

export const buildShareLinkAndData = ({
  password,
  date,
  time,
  sted,
}: Share) => {
  const shareLink = `/?${new URLSearchParams({
    password,
    date,
    time,
    sted,
    share: "true",
  })}`;

  const shareData = {
    title: `Badstu ${capitalize(sted)}`,
    text: `Bli med i badstuen ${formattedTimeAndPlace({
      date,
      time,
      sted,
    })} 🧖`,
    url: shareLink,
  };

  return { shareLink, shareData };
};
