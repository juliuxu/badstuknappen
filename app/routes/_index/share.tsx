import { formattedTimeAndPlace } from "~/utils";
import type { OrderRequest } from "../api.order/schema.server";

export function InviteMessage() {}

export const buildShareLinkAndData = ({
  password,
  date,
  sted,
  time,
}: OrderRequest) => {
  const shareLink = `/?${new URLSearchParams({
    password,
    date,
    sted,
    time,
    share: "true",
  })}`;

  const shareData = {
    title: `Badstu ${sted}`,
    text: `Bli med i badstuen ${formattedTimeAndPlace({ date, time, sted })}`,
    url: shareLink,
  };

  return { shareLink, shareData };
};
