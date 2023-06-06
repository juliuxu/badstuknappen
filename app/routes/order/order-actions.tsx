import { useRouteLoaderData, useSearchParams } from "@remix-run/react";
import type { OrderInfo } from "../../schema/order-info.server";
import { buildShareLinkAndData } from "../_index/share";

export function OrderActions() {
  const [searchParams] = useSearchParams();
  const data = useRouteLoaderData("routes/order");
  if (!data) return null;

  const { orderInfo } = data as { orderInfo: OrderInfo };

  const editLink = `/?${searchParams}`;
  const { shareLink, shareData } = buildShareLinkAndData(orderInfo);
  return (
    <ul>
      <li>
        <a href={editLink} className="secondary">
          🖊️ Endre info
        </a>
      </li>
      <li>
        <a
          data-placement="left"
          data-tooltip="Kopier denne lenken og send til en venn"
          target="_blank"
          href={shareLink}
          className=""
          rel="noreferrer"
          onClick={(e) => {
            if (
              navigator.share !== undefined &&
              navigator.canShare(shareData)
            ) {
              e.preventDefault();
              console.log("sharing", shareData);
              navigator.share({
                ...shareData,
                text: shareData.text + " " + shareLink,
              });
            }
          }}
        >
          🔗 Del
        </a>
      </li>
    </ul>
  );
}
