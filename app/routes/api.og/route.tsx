import type { LoaderArgs } from "@remix-run/node";
import satori from "satori";
import svg2img from "svg2img";

import { getGoogleFont } from "./get-google-font";
import { getShareFromUrl } from "~/schema/share.server";
import { capitalize, formatDateTime } from "~/utils";
import { requirePassword } from "../login/route";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    tw?: string;
  }
}

export async function loader({ request }: LoaderArgs) {
  requirePassword(request);
  const { sted, date, time } = getShareFromUrl(request.url);
  const { formattedDate, formatedClockTime } = formatDateTime({ time, date });

  // Generate SVG
  const svg = await satori(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        backgroundImage: "linear-gradient(to bottom, #dbf4ff, #fff1f1)",
        fontSize: 60,
        letterSpacing: -2,
        fontWeight: 700,
        textAlign: "center",
      }}
    >
      <div
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgb(0, 124, 240), rgb(0, 223, 216))",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Bli med i badstuen
      </div>
      <div
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgb(121, 40, 202), rgb(255, 0, 128))",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {`${formatedClockTime} ${formattedDate}`}
      </div>
      <div
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgb(255, 77, 77), rgb(249, 203, 40))",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {`på ${capitalize(sted)}`}
      </div>
    </div>,
    {
      width: 800,
      height: 400,
      fonts: await Promise.all([
        getGoogleFont("Inter"),
        getGoogleFont("Playfair Display"),
      ]).then((fonts) => fonts.flat()),
    }
  );

  // Convert SVG to PNG
  const { data, error } = await new Promise(
    (
      resolve: (value: { data: Buffer | null; error: Error | null }) => void
    ) => {
      svg2img(svg, (error, buffer) => {
        if (error) {
          resolve({ data: null, error });
        } else {
          resolve({ data: buffer, error: null });
        }
      });
    }
  );
  if (error) {
    return new Response(error.toString(), {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  // Return the image
  return new Response(data, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control":
        process.env.NODE_ENV === "production"
          ? "public, max-age=31536000, immutable"
          : "no-cache",
    },
  });
}
