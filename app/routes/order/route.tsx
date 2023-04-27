import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

const title = "🧖 Bestill Badstue 🌊";
export const meta: V2_MetaFunction = () => {
  return [{ title }];
};

export const loader = ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  url.pathname = "/api/order";
  return redirect(String(url));
};

export default function Index() {
  return (
    <main className="container">
      <h1>{title}</h1>
      <div></div>
    </main>
  );
}
